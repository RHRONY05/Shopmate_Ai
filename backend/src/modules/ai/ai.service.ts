import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/env.js';
import logger from '../../utils/logger.js';
import { geminiToolDeclarations, dispatchToolCall, ToolExecutionContext } from './ai.tools.js';
import { AIMemoryService, ChatMessage } from './ai.memory.js';

export interface AIServiceStreamCallbacks {
  onToolCall?: (tool: { name: string; args: Record<string, unknown> }) => void;
  onToolResult?: (tool: { name: string; result: Record<string, unknown> }) => void;
  onChunk?: (text: string) => void;
  onDone?: (meta: { sessionId: string }) => void;
  onError?: (error: Error) => void;
}

export class AIService {
  private static readonly MODEL_NAME = 'gemini-2.5-flash';
  private static readonly SYSTEM_INSTRUCTION = `
You are the ShopMate AI Senior Kitroom Stylist and Matchday Assistant.
Your mission is to help football fans find the perfect kit, choose correct sizing, customize jerseys with badges and names, and manage their cart.

Guidelines:
1. Tone: Passionate, knowledgeable football fan, courteous, and concise.
2. Tools Discipline:
   - When users describe shirts, clubs, colors, or eras, ALWAYS call the 'search_jerseys' tool to ground your suggestions in authentic catalog items.
   - When users want to add an item to their cart, ALWAYS call the 'add_to_cart' tool.
   - When users ask what is currently in their cart or ask for totals, ALWAYS call the 'get_cart_summary' tool.
   - When users ask about sizing or whether a shirt fits tight/loose, ALWAYS call the 'recommend_size' tool.
3. Pricing & Numbers:
   - State prices clearly in USD (e.g., "85 USD", "15 USD for player printing").
   - NEVER invent shirts, clubs, or prices that do not exist in the tool results.
4. If an item is out of stock in a requested size, explain the situation politely and highlight the sizes that ARE in stock.
`.trim();

  private static getClient() {
    return new GoogleGenAI({
      apiKey: config.geminiApiKey || process.env.GEMINI_API_KEY || '',
    });
  }

  /**
   * Orchestrates multi-turn conversation with function calling and SSE streaming callbacks
   */
  public static async streamChat(
    sessionId: string,
    userMessage: string,
    ctx: ToolExecutionContext,
    callbacks: AIServiceStreamCallbacks
  ): Promise<void> {
    const ai = this.getClient();

    // 1. Retrieve conversation history from Redis
    const history = await AIMemoryService.getSessionHistory(sessionId);

    // 2. Append new user turn
    const workingHistory: ChatMessage[] = [
      ...history,
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ];

    let loopCount = 0;
    const maxLoops = 5;

    try {
      while (loopCount < maxLoops) {
        loopCount++;

        // 3. Call Gemini with function calling tools enabled
        const response = await ai.models.generateContent({
          model: this.MODEL_NAME,
          contents: workingHistory as any,
          config: {
            systemInstruction: this.SYSTEM_INSTRUCTION,
            tools: [{ functionDeclarations: geminiToolDeclarations }],
          },
        });

        const candidate = response.candidates?.[0];
        if (!candidate || !candidate.content) {
          throw new Error('Received empty response from Gemini model');
        }

        const parts = candidate.content.parts || [];
        const functionCalls = response.functionCalls;

        // If the model produced tool calls
        if (functionCalls && functionCalls.length > 0) {
          // Record model turn with function calls into history
          workingHistory.push({
            role: 'model',
            parts: parts.map((p) => {
              if (p.functionCall) {
                return {
                  functionCall: {
                    name: p.functionCall.name || '',
                    args: (p.functionCall.args as Record<string, unknown>) || {},
                  },
                };
              }
              return { text: p.text || '' };
            }),
          });

          // Execute each tool call and collect results
          const toolResponseParts: Array<{
            functionResponse: {
              name: string;
              response: Record<string, unknown>;
            };
          }> = [];

          for (const call of functionCalls) {
            const toolName = call.name || '';
            if (!toolName) continue;
            const toolArgs = (call.args as Record<string, unknown>) || {};

            callbacks.onToolCall?.({ name: toolName, args: toolArgs });

            try {
              const result = await dispatchToolCall(toolName, toolArgs, ctx);
              callbacks.onToolResult?.({ name: toolName, result });

              toolResponseParts.push({
                functionResponse: {
                  name: toolName,
                  response: result,
                },
              });
            } catch (toolError: unknown) {
              const errorMessage = toolError instanceof Error ? toolError.message : 'Tool execution failed';
              const errorResult = { error: errorMessage };
              callbacks.onToolResult?.({ name: toolName, result: errorResult });

              toolResponseParts.push({
                functionResponse: {
                  name: toolName,
                  response: errorResult,
                },
              });
            }
          }

          // Append tool response parts as user/tool turn into working history
          workingHistory.push({
            role: 'user',
            parts: toolResponseParts as any,
          });

          // Loop continues so the model sees the tool outputs and formulates final response
          continue;
        }

        // If the model produced standard text response (final turn)
        const textContent = response.text || '';
        if (textContent) {
          callbacks.onChunk?.(textContent);
        }

        workingHistory.push({
          role: 'model',
          parts: [{ text: textContent }],
        });

        // Break loop as model finished its response
        break;
      }

      // 4. Save updated conversation history to Redis
      await AIMemoryService.saveSessionHistory(sessionId, workingHistory);

      callbacks.onDone?.({ sessionId });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error({ error, sessionId }, '[AIService] Error in streamChat loop');
      callbacks.onError?.(error);
    }
  }
}

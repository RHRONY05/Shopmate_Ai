import type { Request, Response } from 'express';
import { chatRequestSchema } from './ai.schemas.js';
import { AIService } from './ai.service.js';
import logger from '../../utils/logger.js';

/**
 * POST /api/ai/chat
 * Server-Sent Events (SSE) AI streaming endpoint with Function Calling tool execution
 */
export async function streamAIChatHandler(req: Request, res: Response) {
  // 1. Validate payload
  const parseResult = chatRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      message: 'Invalid chat request payload',
      errors: parseResult.error.flatten().fieldErrors,
    });
    return;
  }

  const { message, sessionId, guestSessionId } = parseResult.data;

  // 2. Set strict SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();

  // Send initial keepalive comment
  res.write(': connected\n\n');

  let isConnected = true;
  req.on('close', () => {
    isConnected = false;
    logger.info({ sessionId }, '[AIChatController] Client disconnected from SSE stream');
  });

  const toolContext = {
    userId: req.user?.id || (req.headers['x-user-id'] as string) || undefined,
    guestSessionId: guestSessionId || (req.headers['x-session-id'] as string) || sessionId,
  };

  // Helper to safely write SSE events
  const sendSSE = (event: string, data: Record<string, unknown>) => {
    if (!isConnected) return;
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    await AIService.streamChat(sessionId, message, toolContext, {
      onToolCall: (tool) => {
        sendSSE('tool_call', {
          name: tool.name,
          args: tool.args,
          timestamp: new Date().toISOString(),
        });
      },
      onToolResult: (tool) => {
        sendSSE('tool_result', {
          name: tool.name,
          result: tool.result,
          timestamp: new Date().toISOString(),
        });
      },
      onChunk: (text) => {
        sendSSE('message', {
          text,
        });
      },
      onDone: (meta) => {
        sendSSE('done', {
          sessionId: meta.sessionId,
          status: 'completed',
        });
        if (isConnected) {
          res.end();
        }
      },
      onError: (err) => {
        sendSSE('error', {
          message: err.message || 'An error occurred during AI processing',
        });
        if (isConnected) {
          res.end();
        }
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal streaming error';
    logger.error({ err, sessionId }, '[AIChatController] Unhandled error in stream handler');
    sendSSE('error', { message: errorMsg });
    if (isConnected) {
      res.end();
    }
  }
}

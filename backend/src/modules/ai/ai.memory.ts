import { redis } from '../../config/redis.js';
import logger from '../../utils/logger.js';

const SESSION_TTL_SECONDS = 86400; // 24 hours retention

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{
    text?: string;
    thoughtSignature?: string;
    functionCall?: {
      name: string;
      args: Record<string, unknown>;
    };
    functionResponse?: {
      name: string;
      response: Record<string, unknown>;
    };
  }>;
}

export class AIMemoryService {
  private static getKey(sessionId: string): string {
    return `chat:session:${sessionId}`;
  }

  /**
   * Sanitizes multi-turn chat history for Gemini API compliance:
   * 1. Prunes to at most maxTurns while preserving complete user/model interaction boundaries.
   * 2. Ensures history always begins with an authentic user text prompt.
   * 3. Guarantees every functionResponse is preceded by its matching functionCall.
   * 4. Discards orphaned function calls or dangling turns.
   */
  public static sanitizeHistory(history: ChatMessage[], maxTurns: number = 30): ChatMessage[] {
    if (!Array.isArray(history) || history.length === 0) {
      return [];
    }

    // Step 1: Find a clean user-text start turn within the last maxTurns window
    const startIndexCandidate = Math.max(0, history.length - maxTurns);
    let validStartIndex = -1;

    for (let i = startIndexCandidate; i < history.length; i++) {
      const msg = history[i];
      const isUserText =
        msg.role === 'user' &&
        Array.isArray(msg.parts) &&
        msg.parts.some((p) => typeof p.text === 'string' && p.text.trim().length > 0) &&
        !msg.parts.some((p) => p.functionResponse != null);

      if (isUserText) {
        validStartIndex = i;
        break;
      }
    }

    // If no user-text turn found in the window, search from index 0
    if (validStartIndex === -1) {
      for (let i = 0; i < history.length; i++) {
        const msg = history[i];
        const isUserText =
          msg.role === 'user' &&
          Array.isArray(msg.parts) &&
          msg.parts.some((p) => typeof p.text === 'string' && p.text.trim().length > 0) &&
          !msg.parts.some((p) => p.functionResponse != null);

        if (isUserText) {
          validStartIndex = i;
          break;
        }
      }
    }

    if (validStartIndex === -1) {
      return [];
    }

    const candidateSlice = history.slice(validStartIndex);

    // Step 2: Validate turn sequences (pairing functionCall with functionResponse)
    const sanitized: ChatMessage[] = [];

    for (let i = 0; i < candidateSlice.length; i++) {
      const current = candidateSlice[i];
      if (!current || !Array.isArray(current.parts) || current.parts.length === 0) {
        continue;
      }

      const hasFunctionCall = current.parts.some((p) => p.functionCall != null);
      const hasFunctionResponse = current.parts.some((p) => p.functionResponse != null);

      if (hasFunctionResponse) {
        // Must be preceded by a model turn with functionCall
        const prev = sanitized[sanitized.length - 1];
        if (!prev || prev.role !== 'model' || !prev.parts.some((p) => p.functionCall != null)) {
          logger.warn('[AIMemoryService] Dropping orphaned functionResponse without preceding functionCall');
          continue;
        }
      }

      if (hasFunctionCall) {
        // Must have a following user turn with functionResponse in candidateSlice
        const next = candidateSlice[i + 1];
        if (!next || next.role !== 'user' || !next.parts.some((p) => p.functionResponse != null)) {
          logger.warn('[AIMemoryService] Dropping uncompleted functionCall without subsequent functionResponse');
          continue;
        }
      }

      sanitized.push(current);
    }

    // Step 3: Ensure conversation does not end on a dangling functionCall
    while (
      sanitized.length > 0 &&
      sanitized[sanitized.length - 1].parts.some((p) => p.functionCall != null)
    ) {
      sanitized.pop();
    }

    return sanitized;
  }

  /**
   * Retrieves conversation history for a given session, validated and sanitized
   */
  public static async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const data = await redis.get(this.getKey(sessionId));
      if (!data) return [];
      const parsed = JSON.parse(data) as ChatMessage[];
      return this.sanitizeHistory(parsed, 30);
    } catch (err) {
      logger.error({ err, sessionId }, '[AIMemoryService] Failed to load session history from Redis');
      return [];
    }
  }

  /**
   * Saves conversation history and refreshes 24h TTL
   */
  public static async saveSessionHistory(
    sessionId: string,
    history: ChatMessage[]
  ): Promise<void> {
    try {
      const trimmedHistory = this.sanitizeHistory(history, 30);
      await redis.set(
        this.getKey(sessionId),
        JSON.stringify(trimmedHistory),
        'EX',
        SESSION_TTL_SECONDS
      );
    } catch (err) {
      logger.error({ err, sessionId }, '[AIMemoryService] Failed to save session history to Redis');
    }
  }

  /**
   * Clears conversation history
   */
  public static async clearSessionHistory(sessionId: string): Promise<void> {
    try {
      await redis.del(this.getKey(sessionId));
    } catch (err) {
      logger.error({ err, sessionId }, '[AIMemoryService] Failed to clear session history');
    }
  }
}

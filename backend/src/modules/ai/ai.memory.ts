import { redis } from '../../config/redis.js';
import logger from '../../utils/logger.js';

const SESSION_TTL_SECONDS = 86400; // 24 hours retention

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{
    text?: string;
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
   * Retrieves conversation history for a given session
   */
  public static async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const data = await redis.get(this.getKey(sessionId));
      if (!data) return [];
      return JSON.parse(data) as ChatMessage[];
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
      // Keep last 30 turns to avoid token limit exhaustion
      const trimmedHistory = history.slice(-30);
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

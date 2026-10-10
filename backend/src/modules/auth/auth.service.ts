import { Webhook } from 'svix';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { config } from '../../config/env.js';
import logger from '../../utils/logger.js';

interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

interface ClerkUserData {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email_addresses?: ClerkEmailAddress[];
  primary_email_address_id?: string | null;
  deleted?: boolean;
}

interface ClerkWebhookEvent {
  type: string;
  id?: string;
  data: ClerkUserData;
}

export class AuthService {
  /**
   * Verifies the cryptographic Svix signature of incoming Clerk webhooks
   */
  verifyWebhookSignature(
    rawBody: string | Buffer,
    headers: {
      'svix-id'?: string;
      'svix-timestamp'?: string;
      'svix-signature'?: string;
    },
    overrideSecret?: string
  ): ClerkWebhookEvent {
    const webhookSecret = overrideSecret || config.clerk.webhookSecret;

    if (!webhookSecret) {
      throw new ApiError(500, 'Clerk webhook secret is not configured in backend environment');
    }

    const svixId = headers['svix-id'];
    const svixTimestamp = headers['svix-timestamp'];
    const svixSignature = headers['svix-signature'];

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new ApiError(400, 'Missing required Svix signature headers');
    }

    const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const wh = new Webhook(webhookSecret);

    try {
      return wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      logger.warn({ err }, `[AUTH] Clerk webhook signature verification failed: ${message}`);
      throw new ApiError(400, `Webhook signature verification failed: ${message}`);
    }
  }

  /**
   * Processes verified Clerk webhook events with strict idempotency
   */
  async handleWebhookEvent(event: ClerkWebhookEvent, eventId: string) {
    // 1. Idempotency Check
    const existing = await prisma.processedWebhookEvent.findUnique({
      where: { eventId },
    });

    if (existing) {
      logger.info({ eventId }, '[AUTH] Clerk webhook event already processed. Skipping duplicate.');
      return { eventId, status: 'already_processed' };
    }

    const { type, data } = event;

    // 2. Event Dispatching
    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const primaryEmail = this.resolvePrimaryEmail(data);
        const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ') || null;

        if (!primaryEmail) {
          throw new ApiError(400, `Cannot sync user ${data.id}: Missing email address`);
        }

        await prisma.user.upsert({
          where: { clerkId: data.id },
          create: {
            clerkId: data.id,
            email: primaryEmail,
            name: fullName,
          },
          update: {
            email: primaryEmail,
            name: fullName,
          },
        });
        break;
      }

      case 'user.deleted': {
        const user = await prisma.user.findUnique({
          where: { clerkId: data.id },
        });

        if (user) {
          // Cascade or cleanup user reference
          await prisma.user.delete({
            where: { clerkId: data.id },
          });
        }
        break;
      }

      default:
        logger.info({ type }, `[AUTH] Unhandled Clerk webhook event type: ${type}`);
    }

    // 3. Record Event ID in Processed Events table for Idempotency
    await prisma.processedWebhookEvent.create({
      data: {
        eventId,
        eventType: type,
        source: 'CLERK',
      },
    });

    return { eventId, status: 'processed', eventType: type };
  }

  /**
   * Updates user preferences (favoriteClub, defaultSize)
   */
  async updateUserPreferences(
    userId: string,
    preferences: { favoriteClub?: string; defaultSize?: string }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: preferences,
    });
  }

  private resolvePrimaryEmail(data: ClerkUserData): string | null {
    if (!data.email_addresses || data.email_addresses.length === 0) {
      return null;
    }

    if (data.primary_email_address_id) {
      const primary = data.email_addresses.find(
        (addr) => addr.id === data.primary_email_address_id
      );
      if (primary) {
        return primary.email_address;
      }
    }

    return data.email_addresses[0].email_address;
  }
}

export const authService = new AuthService();

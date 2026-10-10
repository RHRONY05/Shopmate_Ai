import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Webhook } from 'svix';
import app from '../../app.js';
import { prisma } from '../../config/prisma.js';
import { config } from '../../config/env.js';

describe('Clerk Authentication & Webhook Integration Tests', () => {
  const testWebhookSecret = 'whsec_dGVzdF9zZWNyZXRfdGVzdF9zZWNyZXRfdGVzdA==';
  const testClerkId = 'user_clerk_test_999';
  const testEmail = 'bukayo.saka@example.com';
  let testUserId: string;

  beforeAll(async () => {
    // Override webhook secret for test suite
    config.clerk.webhookSecret = testWebhookSecret;

    // Clean test tables
    await prisma.processedWebhookEvent.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.user.deleteMany();

    // Create an initial test user in database
    const user = await prisma.user.create({
      data: {
        clerkId: testClerkId,
        email: testEmail,
        name: 'Bukayo Saka',
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.processedWebhookEvent.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('Protected Route: GET /api/auth/me', () => {
    it('should return 401 Unauthorized when no authentication credential is provided', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 401 Unauthorized when clerkId does not exist in local database', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('x-mock-clerk-id', 'non_existent_clerk_user');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User account not found in database');
    });

    it('should return 200 with user profile and preferences when authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('x-mock-clerk-id', testClerkId);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUserId);
      expect(response.body.data.clerkId).toBe(testClerkId);
      expect(response.body.data.email).toBe(testEmail);
      expect(response.body.data.name).toBe('Bukayo Saka');
    });
  });

  describe('Protected Route: PATCH /api/auth/preferences', () => {
    it('should update user favoriteClub and defaultSize preferences', async () => {
      const response = await request(app)
        .patch('/api/auth/preferences')
        .set('x-mock-clerk-id', testClerkId)
        .send({
          favoriteClub: 'Arsenal',
          defaultSize: 'M',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.favoriteClub).toBe('Arsenal');
      expect(response.body.data.defaultSize).toBe('M');

      // Verify in PostgreSQL
      const dbUser = await prisma.user.findUnique({
        where: { id: testUserId },
      });
      expect(dbUser?.favoriteClub).toBe('Arsenal');
      expect(dbUser?.defaultSize).toBe('M');
    });

    it('should return 400 Bad Request when an invalid size is passed', async () => {
      const response = await request(app)
        .patch('/api/auth/preferences')
        .set('x-mock-clerk-id', testClerkId)
        .send({
          defaultSize: 'EXTRA_LARGE',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Webhook Ingestion: POST /api/webhooks/clerk', () => {
    function generateSignedWebhookHeaders(payloadObj: object) {
      const payloadString = JSON.stringify(payloadObj);
      const wh = new Webhook(testWebhookSecret);
      const msgId = `msg_${Date.now()}`;
      const timestamp = new Date();

      const signature = wh.sign(msgId, timestamp, payloadString);

      return {
        headers: {
          'svix-id': msgId,
          'svix-timestamp': Math.floor(timestamp.getTime() / 1000).toString(),
          'svix-signature': signature,
          'content-type': 'application/json',
        },
        payloadString,
      };
    }

    it('should return 400 Bad Request when Svix headers are missing', async () => {
      const response = await request(app)
        .post('/api/webhooks/clerk')
        .send({ type: 'user.created' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required Svix signature headers');
    });

    it('should return 400 Bad Request when Svix signature is forged/invalid', async () => {
      const response = await request(app)
        .post('/api/webhooks/clerk')
        .set('svix-id', 'fake_msg_id')
        .set('svix-timestamp', '1700000000')
        .set('svix-signature', 'v1,fake_signature_hash')
        .send({ type: 'user.created' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Webhook signature verification failed');
    });

    it('should successfully synchronize user.created event and persist to PostgreSQL', async () => {
      const newClerkId = 'user_clerk_new_fan_101';
      const eventPayload = {
        type: 'user.created',
        id: 'evt_sync_created_001',
        data: {
          id: newClerkId,
          first_name: 'Martin',
          last_name: 'Odegaard',
          email_addresses: [
            {
              id: 'email_odegaard_primary',
              email_address: 'odegaard@example.com',
            },
          ],
          primary_email_address_id: 'email_odegaard_primary',
        },
      };

      const { headers, payloadString } = generateSignedWebhookHeaders(eventPayload);

      const response = await request(app)
        .post('/api/webhooks/clerk')
        .set(headers)
        .send(payloadString);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('processed');

      // Verify user created in PostgreSQL
      const createdUser = await prisma.user.findUnique({
        where: { clerkId: newClerkId },
      });
      expect(createdUser).toBeDefined();
      expect(createdUser?.email).toBe('odegaard@example.com');
      expect(createdUser?.name).toBe('Martin Odegaard');

      // Verify idempotency record created
      const eventRecord = await prisma.processedWebhookEvent.findUnique({
        where: { eventId: 'evt_sync_created_001' },
      });
      expect(eventRecord).toBeDefined();
      expect(eventRecord?.source).toBe('CLERK');
    });

    it('should guarantee idempotency when duplicate user.created event is received', async () => {
      const duplicatePayload = {
        type: 'user.created',
        id: 'evt_sync_created_001', // Exact same event ID as above
        data: {
          id: 'user_clerk_new_fan_101',
          first_name: 'Martin',
          last_name: 'Odegaard',
          email_addresses: [
            {
              id: 'email_odegaard_primary',
              email_address: 'odegaard@example.com',
            },
          ],
        },
      };

      const { headers, payloadString } = generateSignedWebhookHeaders(duplicatePayload);

      const response = await request(app)
        .post('/api/webhooks/clerk')
        .set(headers)
        .send(payloadString);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('already_processed');
    });

    it('should successfully synchronize user.updated event', async () => {
      const updatePayload = {
        type: 'user.updated',
        id: 'evt_sync_updated_002',
        data: {
          id: 'user_clerk_new_fan_101',
          first_name: 'Captain',
          last_name: 'Odegaard',
          email_addresses: [
            {
              id: 'email_odegaard_primary',
              email_address: 'captain.odegaard@example.com',
            },
          ],
        },
      };

      const { headers, payloadString } = generateSignedWebhookHeaders(updatePayload);

      const response = await request(app)
        .post('/api/webhooks/clerk')
        .set(headers)
        .send(payloadString);

      expect(response.status).toBe(200);

      // Verify PostgreSQL user update
      const updatedUser = await prisma.user.findUnique({
        where: { clerkId: 'user_clerk_new_fan_101' },
      });
      expect(updatedUser?.name).toBe('Captain Odegaard');
      expect(updatedUser?.email).toBe('captain.odegaard@example.com');
    });

    it('should successfully process user.deleted event', async () => {
      const deletePayload = {
        type: 'user.deleted',
        id: 'evt_sync_deleted_003',
        data: {
          id: 'user_clerk_new_fan_101',
          deleted: true,
        },
      };

      const { headers, payloadString } = generateSignedWebhookHeaders(deletePayload);

      const response = await request(app)
        .post('/api/webhooks/clerk')
        .set(headers)
        .send(payloadString);

      expect(response.status).toBe(200);

      // Verify user deleted in PostgreSQL
      const deletedUser = await prisma.user.findUnique({
        where: { clerkId: 'user_clerk_new_fan_101' },
      });
      expect(deletedUser).toBeNull();
    });
  });

  describe('Cross-Module Integration: Clerk Auth with Cart Slice', () => {
    it('should automatically associate shopping cart with authenticated user', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('x-mock-clerk-id', testClerkId);

      expect(response.status).toBe(200);
      expect(response.body.data.userId).toBe(testUserId);
    });
  });
});

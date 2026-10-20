import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import app from '../app.js';
import { prisma } from '../config/prisma.js';
import { stripe } from '../config/stripe.js';
import { config } from '../config/env.js';

async function runEndToEndVerification() {
  console.log('🏁 ========================================================');
  console.log('🚀 ShopMate AI — Complete Autonomous End-to-End Test Suite');
  console.log('🏁 ========================================================\n');

  let passedSteps = 0;
  const totalSteps = 6;

  try {
    // ------------------------------------------------------------------------
    // Step 1: Catalog & Club Exploration
    // ------------------------------------------------------------------------
    console.log('1️⃣ Testing Catalog & Club Discovery...');
    const clubsRes = await request(app).get('/api/clubs');
    if (clubsRes.status !== 200 || !clubsRes.body.data || clubsRes.body.data.length === 0) {
      throw new Error(`Failed to fetch clubs: ${JSON.stringify(clubsRes.body)}`);
    }
    console.log(`   ✅ Successfully discovered ${clubsRes.body.data.length} clubs.`);

    const jerseysRes = await request(app).get('/api/jerseys?limit=5');
    const catalogItems = jerseysRes.body.data?.items || jerseysRes.body.data?.jerseys;
    if (jerseysRes.status !== 200 || !catalogItems || catalogItems.length === 0) {
      throw new Error(`Failed to fetch jerseys: ${JSON.stringify(jerseysRes.body)}`);
    }
    const sampleKit = catalogItems[0];
    console.log(`   ✅ Successfully retrieved sample kit: "${sampleKit.title}" (${sampleKit.slug}).`);
    passedSteps++;

    // ------------------------------------------------------------------------
    // Step 2: pgvector Cosine Semantic Search
    // ------------------------------------------------------------------------
    console.log('\n2️⃣ Testing pgvector Semantic Similarity Search via Gemini Embeddings...');
    const searchRes = await request(app)
      .get('/api/search/semantic')
      .query({ q: 'black and white zebra stripes from Turin', limit: 2 });

    if (searchRes.status !== 200 || !searchRes.body.data?.results) {
      throw new Error(`Semantic search failed: ${JSON.stringify(searchRes.body)}`);
    }
    const topMatch = searchRes.body.data.results[0];
    console.log(`   ✅ Top Match: "${topMatch.title}" with ${(topMatch.similarity * 100).toFixed(1)}% match.`);
    passedSteps++;

    // ------------------------------------------------------------------------
    // Step 3: Cart Creation & Server-Authoritative Custom Printing
    // ------------------------------------------------------------------------
    console.log('\n3️⃣ Testing Cart Creation & Server-Authoritative Price Calculation...');
    const testSessionId = `test_sess_${Date.now()}`;

    // Look up a kit variant with stock
    const variant = await prisma.jerseyVariant.findFirst({
      where: { stockQuantity: { gte: 5 } },
      include: { jersey: true },
    });
    if (!variant) throw new Error('No jersey variant with stock found for test');

    const initialStock = variant.stockQuantity;
    const basePrice = Number(variant.jersey.basePrice);
    const expectedTotal = basePrice + 15.0 + 5.0; // Base + 15 custom printing + 5 sleeve badge

    const addToCartRes = await request(app)
      .post('/api/cart/items')
      .set('x-session-id', testSessionId)
      .send({
        jerseyVariantId: variant.id,
        quantity: 1,
        customName: 'SAKA',
        customNumber: 7,
        sleeveBadge: 'Official League Patch',
      });

    if (addToCartRes.status !== 201) {
      throw new Error(`Failed to add item to cart: ${JSON.stringify(addToCartRes.body)}`);
    }
    const cart = addToCartRes.body.data;
    const actualSubtotal = cart.subtotalAmount ?? cart.grandTotal ?? 0;
    if (Math.abs(actualSubtotal - expectedTotal) > 0.01) {
      throw new Error(
        `Server-authoritative pricing mismatch! Expected ${expectedTotal}, got ${actualSubtotal}`
      );
    }
    console.log(
      `   ✅ Cart verified! Base: $${basePrice.toFixed(2)} + Printing: $15.00 + Badge: $5.00 = Total: $${actualSubtotal.toFixed(2)} USD`
    );
    passedSteps++;

    // ------------------------------------------------------------------------
    // Step 4: Stripe PaymentIntent Creation
    // ------------------------------------------------------------------------
    console.log('\n4️⃣ Testing Stripe PaymentIntent Creation with Stock Verification...');
    const intentRes = await request(app)
      .post('/api/payments/create-intent')
      .set('x-session-id', testSessionId)
      .send({
        cartId: cart.id,
        guestEmail: 'matchday-tester@shopmate.ai',
      });

    if (intentRes.status !== 201) {
      throw new Error(`Failed to create PaymentIntent: ${JSON.stringify(intentRes.body)}`);
    }
    const paymentData = intentRes.body.data;
    console.log(`   ✅ PaymentIntent created: ${paymentData.paymentIntentId} ($${paymentData.amount.toFixed(2)} USD).`);
    passedSteps++;

    // ------------------------------------------------------------------------
    // Step 5: Webhook Signature Verification & Atomic Stock Deduction
    // ------------------------------------------------------------------------
    console.log('\n5️⃣ Testing Stripe Webhook Idempotency & Atomic Inventory Row Locks...');
    const simulatedEventId = `evt_e2e_${Date.now()}`;
    const payloadObject = {
      id: simulatedEventId,
      object: 'event',
      api_version: '2025-01-27.acacia',
      created: Math.floor(Date.now() / 1000),
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: paymentData.paymentIntentId,
          amount: paymentData.amountInCents,
          currency: 'usd',
          status: 'succeeded',
          metadata: {
            cartId: cart.id,
            guestEmail: 'matchday-tester@shopmate.ai',
          },
        },
      },
    };

    const rawPayload = JSON.stringify(payloadObject);
    const webhookSecret = config.stripe.webhookSecret || 'whsec_mock';
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: rawPayload,
      secret: webhookSecret,
    });

    // Send webhook
    const webhookRes = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', signature)
      .set('Content-Type', 'application/json')
      .send(rawPayload);

    if (webhookRes.status !== 200) {
      throw new Error(`Webhook handler failed: ${JSON.stringify(webhookRes.body)}`);
    }
    console.log('   ✅ Webhook event processed successfully.');

    // Verify atomic inventory decrement
    const updatedVariant = await prisma.jerseyVariant.findUnique({
      where: { id: variant.id },
    });
    if (!updatedVariant || updatedVariant.stockQuantity !== initialStock - 1) {
      throw new Error(
        `Atomic stock decrement failed! Expected ${initialStock - 1}, found ${updatedVariant?.stockQuantity}`
      );
    }
    console.log(`   ✅ Stock atomically decremented from ${initialStock} -> ${updatedVariant.stockQuantity}.`);

    // Verify Idempotency (resend duplicate event)
    const duplicateRes = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', signature)
      .set('Content-Type', 'application/json')
      .send(rawPayload);

    if (duplicateRes.body.data?.status !== 'already_processed') {
      throw new Error(`Idempotency check failed: ${JSON.stringify(duplicateRes.body)}`);
    }
    console.log('   ✅ Idempotency verified: Duplicate Stripe webhook event safely skipped.');
    passedSteps++;

    // ------------------------------------------------------------------------
    // Step 6: Order Retrieval & Confirmation
    // ------------------------------------------------------------------------
    console.log('\n6️⃣ Testing Order Retrieval & Confirmation Receipt...');
    const orderRes = await request(app).get(`/api/orders/${paymentData.paymentIntentId}`);
    if (orderRes.status !== 200 || !orderRes.body.data) {
      throw new Error(`Failed to fetch order: ${JSON.stringify(orderRes.body)}`);
    }
    const order = orderRes.body.data;
    console.log(`   ✅ Order verified: ${order.orderNumber} (Status: ${order.status}, Total: $${Number(order.totalAmount).toFixed(2)} USD).`);
    console.log(`   ✅ Custom Printing Recorded: #${order.items[0].customNumber} ${order.items[0].customName}`);
    passedSteps++;

    console.log('\n🎉 ========================================================');
    console.log(`🏆 END-TO-END FLOW VERIFICATION COMPLETE: ${passedSteps}/${totalSteps} PASSED!`);
    console.log('🎉 ========================================================');
  } catch (err) {
    console.error('\n❌ End-to-end verification encountered an error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runEndToEndVerification();

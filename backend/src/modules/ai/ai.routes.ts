import { Router } from 'express';
import { streamAIChatHandler } from './ai.controller.js';
import { optionalAuth } from '../../middlewares/authMiddleware.js';

const router = Router();

// POST /api/ai/chat — Server-Sent Events (SSE) AI Streaming Endpoint
router.post('/ai/chat', optionalAuth, streamAIChatHandler);

export default router;

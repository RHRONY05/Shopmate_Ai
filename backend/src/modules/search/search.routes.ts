import { Router } from 'express';
import { semanticSearch } from './search.controller.js';

const router = Router();

// Semantic Search Endpoint
router.get('/search/semantic', semanticSearch);

export default router;

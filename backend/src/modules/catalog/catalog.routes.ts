import { Router } from 'express';
import { getClubs, getJerseys, getJerseyBySlug } from './catalog.controller.js';

const router = Router();

// Public Catalog Endpoints
router.get('/clubs', getClubs);
router.get('/jerseys', getJerseys);
router.get('/jerseys/:slug', getJerseyBySlug);

export default router;

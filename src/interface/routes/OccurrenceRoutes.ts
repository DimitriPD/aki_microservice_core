import { Router } from 'express';
import { OccurrenceController } from '../controllers/OccurrenceController';
import { authMiddleware } from '../middlewares/AuthMiddleware';
import { validateOccurrenceCreate } from '../middlewares/ValidationMiddleware';

export function createOccurrenceRoutes(occurrenceController: OccurrenceController): Router {
  const router = Router();

  // Apply auth middleware to all routes
  router.use(authMiddleware);

  // GET /occurrences - List occurrences with pagination and filters
  router.get('/', (req, res, next) => occurrenceController.listOccurrences(req, res, next));

  // POST /occurrences - Create new occurrence
  router.post('/', validateOccurrenceCreate, (req, res, next) => 
    occurrenceController.createOccurrence(req, res, next)
  );

  return router;
}
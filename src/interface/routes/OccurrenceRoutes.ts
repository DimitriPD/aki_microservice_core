import { Router } from 'express';
import { OccurrenceController } from '../controllers/OccurrenceController';
import { validateOccurrenceCreate } from '../middlewares/ValidationMiddleware';

export function createOccurrenceRoutes(occurrenceController: OccurrenceController): Router {
  const router = Router();

  // Auth removed: endpoints publicly accessible (internal network / gateway responsibility)

  // GET /occurrences - List occurrences with pagination and filters
  router.get('/', (req, res, next) => occurrenceController.listOccurrences(req, res, next));

  // POST /occurrences - Create new occurrence
  router.post('/', validateOccurrenceCreate, (req, res, next) =>
    occurrenceController.createOccurrence(req, res, next)
  );

  return router;
}

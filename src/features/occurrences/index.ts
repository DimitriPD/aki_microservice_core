import { Router } from 'express';
import { registerCreateOccurrenceEndpoint } from './create/CreateOccurrenceEndpoint';
import { registerListOccurrencesEndpoint } from './list/ListOccurrencesEndpoint';

export function buildOccurrencesRouter(): Router {
  const router = Router();
  registerListOccurrencesEndpoint(router);
  registerCreateOccurrenceEndpoint(router);
  return router;
}

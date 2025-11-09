import express from 'express';
import { buildEventsRouter } from './events';
import { buildAttendancesRouter } from './attendances';
import { buildOccurrencesRouter } from './occurrences';

// Central registration for vertical slice feature routers
export function registerFeatureRoutes(app: express.Application) {
  app.use('/v1/events', buildEventsRouter());
  app.use('/v1/attendances', buildAttendancesRouter());
  app.use('/v1/occurrences', buildOccurrencesRouter());
}

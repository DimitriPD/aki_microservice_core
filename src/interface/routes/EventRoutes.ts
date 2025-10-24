import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { authMiddleware } from '../middlewares/AuthMiddleware';
import { validateEventCreate, validateEventUpdate } from '../middlewares/ValidationMiddleware';

export function createEventRoutes(eventController: EventController): Router {
  const router = Router();

  // Apply auth middleware to all routes
  router.use(authMiddleware);

  // GET /events - List events with pagination and filters
  router.get('/', (req, res, next) => eventController.listEvents(req, res, next));

  // POST /events - Create new event
  router.post('/', validateEventCreate, (req, res, next) => 
    eventController.createEvent(req, res, next)
  );

  // GET /events/:eventId - Get specific event
  router.get('/:eventId', (req, res, next) => 
    eventController.getEvent(req, res, next)
  );

  // GET /events/:eventId/qr - Get QR token for event
  router.get('/:eventId/qr', (req, res, next) => 
    eventController.getEventQr(req, res, next)
  );

  // PUT /events/:eventId - Update event
  router.put('/:eventId', validateEventUpdate, (req, res, next) => 
    eventController.updateEvent(req, res, next)
  );

  // DELETE /events/:eventId - Delete event
  router.delete('/:eventId', (req, res, next) => 
    eventController.deleteEvent(req, res, next)
  );

  return router;
}
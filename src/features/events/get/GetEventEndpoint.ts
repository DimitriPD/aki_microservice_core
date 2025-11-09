import { Router } from 'express';
import { ValidationError } from '../../../shared/errors/AppErrors';
import { GetEventHandler } from './GetEventHandler';

export function registerGetEventEndpoint(router: Router) {
  const handler = new GetEventHandler();
  router.get('/:eventId', async (req, res, next) => {
    try {
      const { eventId } = req.params;
      if (!eventId) throw new ValidationError('Event ID is required');
      const data = await handler.handle(eventId);
      res.json({ data, message: 'Event retrieved successfully' });
    } catch (err) { next(err); }
  });
}

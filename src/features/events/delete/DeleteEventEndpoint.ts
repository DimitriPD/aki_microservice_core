import { Router } from 'express';
import { ValidationError } from '../../../shared/errors/AppErrors';
import { DeleteEventHandler } from './DeleteEventHandler';

export function registerDeleteEventEndpoint(router: Router) {
  const handler = new DeleteEventHandler();
  router.delete('/:eventId', async (req, res, next) => {
    try {
      const { eventId } = req.params;
      if (!eventId) throw new ValidationError('Event ID is required');
      await handler.handle(eventId);
      res.status(204).send();
    } catch (err) { next(err); }
  });
}

import { Router } from 'express';
import { ValidationError } from '../../../shared/errors/AppErrors';
import { GetEventQrHandler } from './GetEventQrHandler';

export function registerGetEventQrEndpoint(router: Router) {
  const handler = new GetEventQrHandler();
  router.get('/:eventId/qr', async (req, res, next) => {
    try {
      const { eventId } = req.params;
      if (!eventId) throw new ValidationError('Event ID is required');
      const data = await handler.handle(eventId);
      res.json({ data, message: 'QR token retrieved successfully' });
    } catch (err) { next(err); }
  });
}

import { Router } from 'express';
import { ValidationError } from '../../../shared/errors/AppErrors';
import { GetEventByQrHandler } from './GetEventByQrHandler';

export function registerGetEventByQrEndpoint(router: Router) {
  const handler = new GetEventByQrHandler();
  router.get('/by-qr', async (req, res, next) => {
    try {
      const { qr_token } = req.query;
      if (!qr_token || typeof qr_token !== 'string') {
        throw new ValidationError('QR token is required');
      }
      const data = await handler.handle(qr_token);
      res.json({ data, message: 'Event retrieved successfully by QR token' });
    } catch (err) { next(err); }
  });
}

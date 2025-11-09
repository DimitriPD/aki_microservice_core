import { Router } from 'express';
import { CreateEventSchema } from './CreateEventValidator';
import { CreateEventHandler } from './CreateEventHandler';
import { ValidationError } from '../../../shared/errors/AppErrors';

export function registerCreateEventEndpoint(router: Router) {
  router.post('/', async (req, res, next) => {
    try {
      const parsed = CreateEventSchema.parse(req.body);
      const handler = new CreateEventHandler();
      const data = await handler.handle(parsed);
      res.status(201).json({ data, message: 'Event created successfully' });
    } catch (err: any) {
      if (err.name === 'ZodError') {
        next(new ValidationError('Invalid event data', err.errors.map((e: any) => e.message)));
      } else {
        next(err);
      }
    }
  });
}

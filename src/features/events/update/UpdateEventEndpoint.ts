import { Router } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../../shared/errors/AppErrors';
import { UpdateEventHandler } from './UpdateEventHandler';

const UpdateEventSchema = z.object({
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  status: z.enum(['active', 'closed', 'canceled']).optional()
}).refine(d => {
  if (d.start_time && d.end_time) {
    return new Date(d.start_time) < new Date(d.end_time);
  }
  return true;
}, { message: 'start_time must be before end_time', path: ['start_time'] });

export function registerUpdateEventEndpoint(router: Router) {
  const handler = new UpdateEventHandler();
  router.put('/:eventId', async (req, res, next) => {
    try {
      const { eventId } = req.params;
      if (!eventId) throw new ValidationError('Event ID is required');
      const parsed = UpdateEventSchema.parse(req.body);
      const data = await handler.handle({
        eventId,
        startTime: parsed.start_time,
        endTime: parsed.end_time,
        status: parsed.status
      });
      res.json({ data, message: 'Event updated successfully' });
    } catch (err: any) {
      if (err.name === 'ZodError') {
        next(new ValidationError('Invalid event update data', err.errors.map((e: any) => e.message)));
      } else {
        next(err);
      }
    }
  });
}

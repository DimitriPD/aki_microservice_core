import { z } from 'zod';

export const CreateEventSchema = z.object({
  class_id: z.number().int().positive(),
  teacher_id: z.number().int().positive(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  })
}).refine(d => new Date(d.start_time) < new Date(d.end_time), {
  message: 'start_time must be before end_time',
  path: ['start_time']
}).refine(d => new Date(d.start_time) >= new Date(), {
  message: 'Cannot create events in the past',
  path: ['start_time']
});

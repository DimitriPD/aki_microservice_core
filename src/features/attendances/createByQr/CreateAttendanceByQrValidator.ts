import { z } from 'zod';

export const CreateAttendanceByQrSchema = z.object({
  qr_token: z.string().min(1),
  device_id: z.string().min(1),
  student_cpf: z.string().regex(/^\d{11}$/),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional(),
  device_time: z.string().datetime().optional()
});

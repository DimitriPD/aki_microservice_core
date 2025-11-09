import { z } from 'zod';

export const CreateOccurrenceSchema = z.object({
  type: z.enum(['student_not_in_class', 'manual_note', 'invalid_qr', 'duplicate_scan']),
  teacher_id: z.number().int().positive(),
  student_cpf: z.string().regex(/^\d{11}$/).optional(),
  class_id: z.number().int().positive().optional(),
  description: z.string().min(1).max(1000)
});

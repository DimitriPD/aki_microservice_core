import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/AppErrors';

// Validation schemas
const EventCreateSchema = z.object({
  class_id: z.number().int().positive('Class ID must be a positive integer'),
  teacher_id: z.number().int().positive('Teacher ID must be a positive integer'),
  start_time: z.string().datetime('Start time must be a valid ISO datetime'),
  end_time: z.string().datetime('End time must be a valid ISO datetime'),
  location: z.object({
    latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
    longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180')
  })
}).refine(
  (data) => new Date(data.start_time) < new Date(data.end_time),
  {
    message: 'Start time must be before end time',
    path: ['start_time']
  }
).refine(
  (data) => new Date(data.start_time) >= new Date(),
  {
    message: 'Cannot create events in the past',
    path: ['start_time']
  }
);

const AttendanceByQrSchema = z.object({
  qr_token: z.string().min(1, 'QR token is required'),
  device_id: z.string().min(1, 'Device ID is required'),
  student_cpf: z.string().regex(/^\d{11}$/, 'Student CPF must be 11 digits'),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional(),
  device_time: z.string().datetime().optional()
});

const EventUpdateSchema = z.object({
  start_time: z.string().datetime('Start time must be a valid ISO datetime').optional(),
  end_time: z.string().datetime('End time must be a valid ISO datetime').optional(),
  status: z.enum(['active', 'closed', 'canceled']).optional()
}).refine(
  (data) => {
    if (data.start_time && data.end_time) {
      return new Date(data.start_time) < new Date(data.end_time);
    }
    return true;
  },
  {
    message: 'Start time must be before end time',
    path: ['start_time']
  }
);

const OccurrenceCreateSchema = z.object({
  type: z.enum(['student_not_in_class', 'manual_note', 'invalid_qr', 'duplicate_scan']),
  teacher_id: z.number().int().positive(),
  student_cpf: z.string().regex(/^\d{11}$/).optional(),
  class_id: z.number().int().positive().optional(),
  description: z.string().min(1).max(1000)
});

// Validation middleware functions
export function validateEventCreate(req: Request, res: Response, next: NextFunction): void {
  try {
    EventCreateSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      next(new ValidationError('Invalid event data', errors));
    } else {
      next(error);
    }
  }
}

export function validateAttendanceByQr(req: Request, res: Response, next: NextFunction): void {
  try {
    AttendanceByQrSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      next(new ValidationError('Invalid attendance data', errors));
    } else {
      next(error);
    }
  }
}

export function validateEventUpdate(req: Request, res: Response, next: NextFunction): void {
  try {
    EventUpdateSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      next(new ValidationError('Invalid event update data', errors));
    } else {
      next(error);
    }
  }
}

export function validateOccurrenceCreate(req: Request, res: Response, next: NextFunction): void {
  try {
    OccurrenceCreateSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      next(new ValidationError('Invalid occurrence data', errors));
    } else {
      next(error);
    }
  }
}
import { Router } from 'express';
import { CreateAttendanceByQrSchema } from './CreateAttendanceByQrValidator';
import { CreateAttendanceByQrHandler } from './CreateAttendanceByQrHandler';
import { ValidationError } from '../../../shared/errors/AppErrors';

export function registerCreateAttendanceByQrEndpoint(router: Router) {
  router.post('/', async (req, res, next) => {
    try {
      const parsed = CreateAttendanceByQrSchema.parse(req.body);
      const handler = new CreateAttendanceByQrHandler();
      const data = await handler.handle(parsed);
      res.status(201).json({ data, message: 'Attendance recorded successfully' });
    } catch (err: any) {
      if (err.name === 'ZodError') {
        next(new ValidationError('Invalid attendance data', err.errors.map((e: any) => e.message)));
      } else {
        next(err);
      }
    }
  });
}

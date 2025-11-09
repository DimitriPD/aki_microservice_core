import { Router } from 'express';
import { getDependencies } from '../../_shared/Dependencies';
import { ValidationError, NotFoundError } from '../../../shared/errors/AppErrors';
import { AttendanceId } from '../domain/value-objects/AttendanceId';
import { z } from 'zod';

const UpdateAttendanceSchema = z.object({
  status: z.enum(['recorded', 'manual', 'retroactive', 'invalid'])
});

export function registerUpdateAttendanceEndpoint(router: Router) {
  const deps = getDependencies();

  router.put('/:attendanceId', async (req, res, next) => {
    try {
      const { attendanceId } = req.params;
      if (!attendanceId) throw new ValidationError('Attendance ID is required');
      const parsed = UpdateAttendanceSchema.parse(req.body);
      const attendance = await deps.attendanceRepository.findById(new AttendanceId(attendanceId));
      if (!attendance) throw new NotFoundError('Attendance not found');
  attendance.updateStatus(parsed.status, 'system');
      const updated = await deps.attendanceRepository.update(attendance);
      res.json({ data: updated.toObject(), message: 'Attendance updated successfully' });
    } catch (err: any) {
      if (err.name === 'ZodError') {
        next(new ValidationError('Invalid attendance update data', err.errors.map((e: any) => e.message)));
      } else { next(err); }
    }
  });
}

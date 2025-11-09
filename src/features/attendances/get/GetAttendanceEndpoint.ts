import { Router } from 'express';
import { getDependencies } from '../../_shared/Dependencies';
import { ValidationError, NotFoundError } from '../../../shared/errors/AppErrors';
import { AttendanceId } from '../domain/value-objects/AttendanceId';

export function registerGetAttendanceEndpoint(router: Router) {
  const deps = getDependencies();

  router.get('/:attendanceId', async (req, res, next) => {
    try {
      const { attendanceId } = req.params;
      if (!attendanceId) throw new ValidationError('Attendance ID is required');
      const attendance = await deps.attendanceRepository.findById(new AttendanceId(attendanceId));
      if (!attendance) throw new NotFoundError('Attendance not found');
      res.json({ data: attendance.toObject(), message: 'Attendance retrieved successfully' });
    } catch (err) { next(err); }
  });
}

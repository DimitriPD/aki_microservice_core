import { Router } from 'express';
import { getDependencies } from '../../_shared/Dependencies';

export function registerListAttendancesEndpoint(router: Router) {
  const deps = getDependencies();

  router.get('/', async (req, res, next) => {
    try {
      const { page = '1', size = '100', event_id, student_id, status } = req.query;
      const filters: any = {};
      if (event_id) filters.eventId = event_id as string;
      if (student_id) filters.studentId = parseInt(student_id as string, 10);
      if (status) filters.status = status as string;
      const pagination = {
        page: parseInt(page as string, 10),
        size: parseInt(size as string, 10)
      };
      const result = await deps.attendanceRepository.findAll(filters, pagination);
      res.json({
        data: result.items.map(a => a.toObject()),
        meta: result.meta,
        message: 'Attendances retrieved successfully'
      });
    } catch (err) { next(err); }
  });
}

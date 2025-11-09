import { Router } from 'express';
import { EventStatus } from '../domain/value-objects/EventStatus';
import { ListEventsHandler } from './ListEventsHandler';

export function registerListEventsEndpoint(router: Router) {
  const handler = new ListEventsHandler();
  router.get('/', async (req, res, next) => {
    try {
      const { page = '1', size = '50', class_id, teacher_id, status } = req.query;
      const data = await handler.handle({
        page: parseInt(page as string, 10),
        size: parseInt(size as string, 10),
        classId: class_id ? parseInt(class_id as string, 10) : undefined,
        teacherId: teacher_id ? parseInt(teacher_id as string, 10) : undefined,
        status: status as EventStatus | undefined
      });
      res.json({
        data: data.items,
        meta: data.meta,
        message: 'Events retrieved successfully'
      });
    } catch (err) { next(err); }
  });
}

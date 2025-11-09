import { Router } from 'express';
import { getDependencies } from '../../_shared/Dependencies';

export function registerListOccurrencesEndpoint(router: Router) {
  const deps = getDependencies();

  router.get('/', async (req, res, next) => {
    try {
      const { page = '1', size = '50', class_id, teacher_id, type, student_cpf } = req.query;
      const filters: any = {};
      if (class_id) filters.classId = parseInt(class_id as string, 10);
      if (teacher_id) filters.teacherId = parseInt(teacher_id as string, 10);
      if (type) filters.type = type as string;
      if (student_cpf) filters.studentCpf = student_cpf as string;
      const pagination = { page: parseInt(page as string, 10), size: parseInt(size as string, 10) };
      const result = await deps.occurrenceRepository.findAll(filters, pagination);
      res.json({ data: result.items.map(o => o.toObject()), meta: result.meta, message: 'Occurrences retrieved successfully' });
    } catch (err) { next(err); }
  });
}

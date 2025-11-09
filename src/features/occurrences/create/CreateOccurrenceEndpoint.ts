import { Router } from 'express';
import { CreateOccurrenceSchema } from './CreateOccurrenceValidator';
import { getDependencies } from '../../_shared/Dependencies';
import { ValidationError } from '../../../shared/errors/AppErrors';
import { Occurrence } from '../domain/entities/Occurrence';

export function registerCreateOccurrenceEndpoint(router: Router) {
  const deps = getDependencies();

  router.post('/', async (req, res, next) => {
    try {
      const parsed = CreateOccurrenceSchema.parse(req.body);

      // Teacher & class membership checks delegated to original controller logic (could be moved to handler)
      // For now we rely on Personas service inline for parity with previous implementation.
      const teacher = await deps.personasService.getTeacherById(parsed.teacher_id);
      if (!teacher) throw new ValidationError('Teacher not found');

      if (parsed.class_id) {
        const klass = await deps.personasService.getClassById(parsed.class_id);
        if (!klass) throw new ValidationError('Class not found');
        const teacherInClass = await deps.personasService.isTeacherInClass(parsed.teacher_id, parsed.class_id);
        if (!teacherInClass) throw new ValidationError('Teacher not member of class');
      }

      if (parsed.student_cpf) {
        const student = await deps.personasService.getStudentByCpf(parsed.student_cpf);
        if (!student) throw new ValidationError('Student not found');
        if (parsed.class_id) {
          const studentInClass = await deps.personasService.isStudentInClass(student.id, parsed.class_id);
          if (!studentInClass && parsed.type !== 'student_not_in_class') {
            throw new ValidationError('Student not in class for this occurrence type');
          }
        }
      }

      const occurrence = Occurrence.create({
        type: parsed.type,
        teacherId: parsed.teacher_id,
        studentCpf: parsed.student_cpf,
        classId: parsed.class_id,
        description: parsed.description,
        notifiedToInstitution: false
      });

      const saved = await deps.occurrenceRepository.save(occurrence);
      res.status(201).json({ data: saved.toObject(), message: 'Occurrence created successfully' });
    } catch (err: any) {
      if (err.name === 'ZodError') {
        next(new ValidationError('Invalid occurrence data', err.errors.map((e: any) => e.message)));
      } else { next(err); }
    }
  });
}

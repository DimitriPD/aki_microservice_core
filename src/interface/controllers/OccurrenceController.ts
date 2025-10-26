import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError } from '../../shared/errors/AppErrors';
import { logger } from '../../shared/logger/Logger';
import { OccurrenceRepositoryImpl } from '../../infrastructure/repositories/OccurrenceRepositoryImpl';
import { Occurrence } from '../../domain/entities/Occurrence';
import { OccurrenceId } from '../../domain/value-objects/CommonTypes';
import { PersonasService } from '../../application/services/PersonasService';

export class OccurrenceController {
  constructor(
    private occurrenceRepository: OccurrenceRepositoryImpl,
    private personasService: PersonasService
  ) {}

  async createOccurrence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, teacher_id, student_cpf, class_id, description } = req.body;

      if (!type || !teacher_id || !description) {
        throw new ValidationError('Missing required fields: type, teacher_id, description');
      }

      // Validate teacher existence
      const teacher = await this.personasService.getTeacherById(teacher_id);
      if (!teacher) {
        throw new ValidationError('Teacher not found');
      }

      // If class provided validate class and membership
      if (class_id) {
        const klass = await this.personasService.getClassById(class_id);
        if (!klass) {
          throw new ValidationError('Class not found');
        }
        const teacherInClass = await this.personasService.isTeacherInClass(teacher_id, class_id);
        if (!teacherInClass) {
          throw new ValidationError('Teacher is not member of class');
        }
      }

      // If student CPF provided validate student existence
      if (student_cpf) {
        const student = await this.personasService.getStudentByCpf(student_cpf);
        if (!student) {
          throw new ValidationError('Student not found');
        }
        if (class_id) {
          const studentInClass = await this.personasService.isStudentInClass(student.id, class_id);
          if (!studentInClass && type !== 'student_not_in_class') {
            throw new ValidationError('Student not in class for this occurrence type');
          }
        }
      }

      const occurrence = Occurrence.create({
        type,
        teacherId: teacher_id,
        studentCpf: student_cpf,
        classId: class_id,
        description,
        notifiedToInstitution: false
      });
      const saved = await this.occurrenceRepository.save(occurrence);

      logger.info('Occurrence created', {
        occurrenceId: saved.id?.toString(),
        type,
        teacherId: teacher_id
      });

      res.status(201).json({
        data: saved.toObject(),
        message: 'Occurrence created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async listOccurrences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', size = '50', class_id, teacher_id, type, student_cpf } = req.query;
      const filters: any = {};
      if (class_id) filters.classId = parseInt(class_id as string, 10);
      if (teacher_id) filters.teacherId = parseInt(teacher_id as string, 10);
      if (type) filters.type = type as string;
      if (student_cpf) filters.studentCpf = student_cpf as string;

      const pagination = {
        page: parseInt(page as string, 10),
        size: parseInt(size as string, 10)
      };
      const result = await this.occurrenceRepository.findAll(filters, pagination);
      res.json({
        data: result.items.map(o => o.toObject()),
        meta: result.meta,
        message: 'Occurrences retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
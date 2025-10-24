import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../shared/errors/AppErrors';
import { logger } from '../../shared/logger/Logger';

export class OccurrenceController {
  constructor() {}

  async createOccurrence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, teacher_id, student_cpf, class_id, description } = req.body;

      // Validate required fields
      if (!type || !teacher_id || !description) {
        throw new ValidationError('Missing required fields: type, teacher_id, description');
      }

      // For now, create a mock occurrence response
      const occurrence = {
        id: 'mock-occurrence-id',
        type,
        teacher_id,
        student_cpf,
        class_id,
        description,
        created_at: new Date().toISOString(),
        notified_to_institution: false
      };

      logger.info('Occurrence created', { 
        type,
        teacherId: teacher_id,
        studentCpf: student_cpf 
      });

      res.status(201).json({
        data: occurrence,
        message: 'Occurrence created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async listOccurrences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = '1',
        size = '50',
        class_id,
        teacher_id
      } = req.query;

      // For now, return empty list
      const result = {
        items: [],
        meta: {
          page: parseInt(page as string, 10),
          size: parseInt(size as string, 10),
          total: 0
        }
      };

      res.json({
        data: result.items,
        meta: result.meta,
        message: 'Occurrences retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
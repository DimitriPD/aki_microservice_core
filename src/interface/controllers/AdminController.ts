import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../shared/errors/AppErrors';
import { logger } from '../../shared/logger/Logger';

export class AdminController {
  constructor() {}

  async exportAttendances(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { event_id, class_id, from, to } = req.body;

      // Generate a mock job ID
      const jobId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      logger.info('Export attendances job created', {
        job_id: jobId,
        filters: { event_id, class_id, from, to }
      });

      res.status(202).json({
        data: {
          job_id: jobId,
          status: 'accepted'
        },
        message: 'Export job created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
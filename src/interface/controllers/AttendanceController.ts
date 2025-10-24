import { Request, Response, NextFunction } from 'express';
import { CreateAttendanceByQrUseCase } from '../../application/use-cases/attendances/CreateAttendanceByQrUseCase';
import { ValidationError } from '../../shared/errors/AppErrors';
import { logger } from '../../shared/logger/Logger';

export class AttendanceController {
  constructor(
    private createAttendanceByQrUseCase: CreateAttendanceByQrUseCase
  ) {}

  async createAttendanceByQr(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { qr_token, device_id, student_cpf, location, device_time } = req.body;

      // Validate required fields
      if (!qr_token || !device_id || !student_cpf) {
        throw new ValidationError('Missing required fields: qr_token, device_id, student_cpf');
      }

      const attendance = await this.createAttendanceByQrUseCase.execute({
        qrToken: qr_token,
        deviceId: device_id,
        studentCpf: student_cpf,
        location,
        deviceTime: device_time ? new Date(device_time) : undefined
      });

      logger.info('Attendance created via QR', { 
        attendanceId: attendance.id?.toString(),
        studentCpf: student_cpf 
      });

      res.status(201).json({
        data: attendance.toObject(),
        message: 'Attendance recorded successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async listAttendances(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = '1',
        size = '100',
        event_id,
        student_id,
        status
      } = req.query;

      // For now, return empty list since we haven't implemented the list use case yet
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
        message: 'Attendances retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { attendanceId } = req.params;

      if (!attendanceId) {
        throw new ValidationError('Attendance ID is required');
      }

      // For now, return not found since we haven't implemented the get use case yet
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Attendance not found',
          details: []
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { attendanceId } = req.params;
      const { status, created_by, note } = req.body;

      if (!attendanceId) {
        throw new ValidationError('Attendance ID is required');
      }

      // For now, return a mock response since we haven't implemented UpdateAttendanceUseCase
      res.json({
        data: {
          id: attendanceId,
          message: 'Attendance update functionality not yet implemented'
        },
        message: 'Attendance updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
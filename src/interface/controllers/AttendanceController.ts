import { Request, Response, NextFunction } from 'express';
import { CreateAttendanceByQrUseCase } from '../../application/use-cases/attendances/CreateAttendanceByQrUseCase';
import { ValidationError, NotFoundError } from '../../shared/errors/AppErrors';
import { logger } from '../../shared/logger/Logger';
import { AttendanceRepositoryImpl } from '../../infrastructure/repositories/AttendanceRepositoryImpl';
import { AttendanceId } from '../../domain/value-objects/CommonTypes';

export class AttendanceController {
  constructor(
    private createAttendanceByQrUseCase: CreateAttendanceByQrUseCase,
    private attendanceRepository: AttendanceRepositoryImpl
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
      const { page = '1', size = '100', event_id, student_id, status } = req.query;

      const filters: any = {};
      if (event_id) filters.eventId = event_id as string;
      if (student_id) filters.studentId = parseInt(student_id as string, 10);
      if (status) filters.status = status as string;

      const pagination = {
        page: parseInt(page as string, 10),
        size: parseInt(size as string, 10)
      };

      const result = await this.attendanceRepository.findAll(filters, pagination);

      res.json({
        data: result.items.map(a => a.toObject()),
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
      const attendance = await this.attendanceRepository.findById(new AttendanceId(attendanceId));
      if (!attendance) {
        throw new NotFoundError('Attendance not found');
      }
      res.json({
        data: attendance.toObject(),
        message: 'Attendance retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { attendanceId } = req.params;
      const { status } = req.body;
      if (!attendanceId) {
        throw new ValidationError('Attendance ID is required');
      }
      if (!status) {
        throw new ValidationError('Status is required');
      }
      const attendance = await this.attendanceRepository.findById(new AttendanceId(attendanceId));
      if (!attendance) {
        throw new NotFoundError('Attendance not found');
      }
      attendance.updateStatus(status, 'system');
      const updated = await this.attendanceRepository.update(attendance);
      res.json({
        data: updated.toObject(),
        message: 'Attendance updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
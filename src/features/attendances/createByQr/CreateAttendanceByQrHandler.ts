import { getDependencies } from '../../_shared/Dependencies';
import { CreateAttendanceByQrCommand } from './CreateAttendanceByQrCommand';
import { Attendance } from '../domain/entities/Attendance';
import { ValidationResult } from '../domain/value-objects/ValidationResult';
import { Location } from '../domain/value-objects/Location';
import { EventId } from '../../events/domain/value-objects/EventId';
import { ConflictError, ValidationError, NotFoundError } from '../../../shared/errors/AppErrors';
import { validateAttendanceLocation } from '../../../shared/utils/GeoUtils';
import { QRTokenPayload } from '../../../shared/utils/TokenService';
import { logger } from '../../../shared/logger/Logger';

export class CreateAttendanceByQrHandler {
  async handle(cmd: CreateAttendanceByQrCommand) {
    const deps = getDependencies();

    logger.info('Processing attendance by QR', { 
      deviceId: cmd.device_id, 
      studentCpf: cmd.student_cpf 
    });

    // Validate and decode QR token
    let tokenPayload: QRTokenPayload;
    try {
      tokenPayload = deps.tokenService.verifyQRToken(cmd.qr_token);
    } catch (error) {
      throw new ValidationError('Invalid or expired QR token');
    }

    // Get event details
    const eventId = new EventId(tokenPayload.eventId);
    const event = await deps.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Validate event is active
    if (!event.isActive()) {
      throw new ValidationError('Event is not active');
    }

    // Get student details from Personas service
    const student = await deps.personasService.getStudentByCpf(cmd.student_cpf);
    if (!student) {
      throw new ValidationError('Student not found');
    }

    // Validate student belongs to the class
    const isStudentInClass = await deps.personasService.isStudentInClass(
      student.id,
      event.classId
    );

    if (!isStudentInClass) {
      logger.warn('Student not in class', { 
        studentId: student.id, 
        classId: event.classId 
      });
      throw new ValidationError('Student is not enrolled in this class');
    }

    // Check if attendance already exists
    const existingAttendance = await deps.attendanceRepository.findByEventAndStudent(
      event.id!.toString(),
      student.id
    );

    if (existingAttendance) {
      throw new ConflictError('Attendance already recorded for this student');
    }

    // Validate location if provided
    let validation: ValidationResult | undefined;
    let studentLocation: Location | undefined;

    if (cmd.location) {
      studentLocation = new Location(cmd.location.latitude, cmd.location.longitude);
      const distanceValidation = validateAttendanceLocation(
        event.location.latitude,
        event.location.longitude,
        cmd.location.latitude,
        cmd.location.longitude
      );
      validation = ValidationResult.create(
        distanceValidation.withinRadius,
        distanceValidation.distanceMeters
      );
      logger.info('Location validation result', {
        studentId: student.id,
        eventId: event.id?.toString(),
        withinRadius: validation.withinRadius,
        distanceMeters: validation.distanceMeters
      });
    }

    // Create attendance record
    const attendanceData: any = {
      eventId: event.id!.toString(),
      studentId: student.id,
      status: 'recorded',
      timestamp: cmd.device_time ? new Date(cmd.device_time) : new Date(),
      createdBy: 'system'
    };
    if (studentLocation) attendanceData.location = studentLocation;
    if (validation) attendanceData.validation = validation;

    const attendance = Attendance.create(attendanceData);
    const savedAttendance = await deps.attendanceRepository.save(attendance);

    logger.info('Attendance created successfully', {
      attendanceId: savedAttendance.id?.toString(),
      studentId: student.id,
      eventId: event.id?.toString()
    });

    return savedAttendance.toObject();
  }
}

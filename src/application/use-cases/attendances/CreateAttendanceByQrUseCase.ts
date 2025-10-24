import { Attendance } from '../../../domain/entities/Attendance';
import { ValidationResult } from '../../../domain/value-objects/ValidationResult';
import { Location } from '../../../domain/value-objects/Location';
import { IAttendanceRepository } from '../../../domain/repositories/IAttendanceRepository';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { EventId } from '../../../domain/value-objects/CommonTypes';
import { ConflictError, ValidationError, NotFoundError } from '../../../shared/errors/AppErrors';
import { TokenService, QRTokenPayload } from '../../../shared/utils/TokenService';
import { validateAttendanceLocation } from '../../../shared/utils/GeoUtils';
import { PersonasService } from '../../services/PersonasService';
import { logger } from '../../../shared/logger/Logger';

export interface CreateAttendanceByQrRequest {
  qrToken: string;
  deviceId: string;
  studentCpf: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  deviceTime?: Date;
}

export class CreateAttendanceByQrUseCase {
  constructor(
    private attendanceRepository: IAttendanceRepository,
    private eventRepository: IEventRepository,
    private tokenService: TokenService,
    private personasService: PersonasService
  ) {}

  async execute(request: CreateAttendanceByQrRequest): Promise<Attendance> {
    logger.info('Processing attendance by QR', { 
      deviceId: request.deviceId, 
      studentCpf: request.studentCpf 
    });

    // Validate and decode QR token
    let tokenPayload: QRTokenPayload;
    try {
      tokenPayload = this.tokenService.verifyQRToken(request.qrToken);
    } catch (error) {
      throw new ValidationError('Invalid or expired QR token');
    }

    // Get event details
    const eventId = new EventId(tokenPayload.eventId);
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Validate event is active
    if (!event.isActive()) {
      throw new ValidationError('Event is not active');
    }

    // Get student details from Personas service
    const student = await this.personasService.getStudentByCpf(request.studentCpf);
    if (!student) {
      throw new ValidationError('Student not found');
    }

    // Validate student belongs to the class
    const isStudentInClass = await this.personasService.isStudentInClass(
      student.id,
      event.classId
    );

    if (!isStudentInClass) {
      // Create occurrence for student not in class
      logger.warn('Student not in class', { 
        studentId: student.id, 
        classId: event.classId 
      });
      
      // TODO: Create occurrence and send notification
      throw new ValidationError('Student is not enrolled in this class');
    }

    // Check if attendance already exists
    const existingAttendance = await this.attendanceRepository.findByEventAndStudent(
      event.id!.toString(),
      student.id
    );

    if (existingAttendance) {
      throw new ConflictError('Attendance already recorded for this student');
    }

    // Validate location if provided
    let validation: ValidationResult | undefined;
    let studentLocation: Location | undefined;

    if (request.location) {
      studentLocation = new Location(request.location.latitude, request.location.longitude);
      
      const distanceValidation = validateAttendanceLocation(
        event.location.latitude,
        event.location.longitude,
        request.location.latitude,
        request.location.longitude
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
      timestamp: request.deviceTime || new Date(),
      createdBy: 'system'
    };
    
    if (studentLocation) {
      attendanceData.location = studentLocation;
    }
    
    if (validation) {
      attendanceData.validation = validation;
    }

    const attendance = Attendance.create(attendanceData);

    const savedAttendance = await this.attendanceRepository.save(attendance);

    logger.info('Attendance created successfully', {
      attendanceId: savedAttendance.id?.toString(),
      studentId: student.id,
      eventId: event.id?.toString()
    });

    return savedAttendance;
  }
}
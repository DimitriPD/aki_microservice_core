import { Event } from '../../../domain/entities/Event';
import { EventId } from '../../../domain/value-objects/CommonTypes';
import { Location } from '../../../domain/value-objects/Location';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { ConflictError, ValidationError } from '../../../shared/errors/AppErrors';
import { TokenService } from '../../../shared/utils/TokenService';
import { PersonasService } from '../../services/PersonasService';

export interface CreateEventRequest {
  classId: number;
  teacherId: number;
  startTime: Date;
  endTime: Date;
  location: {
    latitude: number;
    longitude: number;
  };
}

export class CreateEventUseCase {
  constructor(
    private eventRepository: IEventRepository,
    private tokenService: TokenService,
    private personasService: PersonasService
  ) {}

  async execute(request: CreateEventRequest): Promise<Event> {
    // Validate input
    this.validateRequest(request);

    // Personas validations (teacher & class)
    const teacher = await this.personasService.getTeacherById(request.teacherId);
    if (!teacher) {
      throw new ValidationError('Teacher not found');
    }

    const klass = await this.personasService.getClassById(request.classId);
    if (!klass) {
      throw new ValidationError('Class not found');
    }

    const teacherInClass = await this.personasService.isTeacherInClass(request.teacherId, request.classId);
    if (!teacherInClass) {
      throw new ValidationError('Teacher is not a member of the specified class');
    }

    // Check for overlapping events
    const overlappingEvents = await this.eventRepository.findOverlappingEvents(
      request.classId,
      request.startTime,
      request.endTime
    );

    if (overlappingEvents.length > 0) {
      throw new ConflictError(
        'Event time conflicts with existing event for this class',
        overlappingEvents.map(e => `Event: ${e.id?.toString()} (${e.startTime} - ${e.endTime})`)
      );
    }

    // Create event
    const location = new Location(request.location.latitude, request.location.longitude);
    const event = Event.create({
      classId: request.classId,
      teacherId: request.teacherId,
      startTime: request.startTime,
      endTime: request.endTime,
      location,
      status: 'active'
    });

    // Save event
    const savedEvent = await this.eventRepository.save(event);

    // Generate QR token
    if (savedEvent.id) {
      const qrToken = this.tokenService.generateQRToken(
        savedEvent.id.toString(),
        savedEvent.classId,
        savedEvent.teacherId,
        savedEvent.endTime
      );
      
      savedEvent.setQrToken(qrToken);
      return await this.eventRepository.update(savedEvent);
    }

    return savedEvent;
  }

  private validateRequest(request: CreateEventRequest): void {
    const errors: string[] = [];

    if (request.classId <= 0) {
      errors.push('classId must be a positive number');
    }

    if (request.teacherId <= 0) {
      errors.push('teacherId must be a positive number');
    }

    if (request.startTime >= request.endTime) {
      errors.push('startTime must be before endTime');
    }

    if (request.startTime < new Date()) {
      errors.push('Cannot create events in the past');
    }

    if (request.location.latitude < -90 || request.location.latitude > 90) {
      errors.push('latitude must be between -90 and 90');
    }

    if (request.location.longitude < -180 || request.location.longitude > 180) {
      errors.push('longitude must be between -180 and 180');
    }

    if (errors.length > 0) {
      throw new ValidationError('Invalid event data', errors);
    }
  }
}
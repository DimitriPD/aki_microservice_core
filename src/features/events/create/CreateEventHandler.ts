import { CreateEventCommand } from './CreateEventCommand';
import { getDependencies } from '../../_shared/Dependencies';
import { Event } from '../domain/entities/Event';
import { Location } from '../domain/value-objects/Location';
import { ConflictError, ValidationError } from '../../../shared/errors/AppErrors';

export class CreateEventHandler {
  async handle(cmd: CreateEventCommand) {
    const deps = getDependencies();

    // Validate input (mirroring previous use-case)
    const errors: string[] = [];
    if (cmd.class_id <= 0) errors.push('class_id must be a positive number');
    if (cmd.teacher_id <= 0) errors.push('teacher_id must be a positive number');
    const startTime = new Date(cmd.start_time);
    const endTime = new Date(cmd.end_time);
    if (startTime >= endTime) errors.push('start_time must be before end_time');
    if (startTime < new Date()) errors.push('Cannot create events in the past');
    if (cmd.location.latitude < -90 || cmd.location.latitude > 90) errors.push('latitude must be between -90 and 90');
    if (cmd.location.longitude < -180 || cmd.location.longitude > 180) errors.push('longitude must be between -180 and 180');
    if (errors.length) throw new ValidationError('Invalid event data', errors);

    // Personas validations
    const teacher = await deps.personasService.getTeacherById(cmd.teacher_id);
    if (!teacher) throw new ValidationError('Teacher not found');
    const klass = await deps.personasService.getClassById(cmd.class_id);
    if (!klass) throw new ValidationError('Class not found');
    const teacherInClass = await deps.personasService.isTeacherInClass(cmd.teacher_id, cmd.class_id);
    if (!teacherInClass) throw new ValidationError('Teacher is not a member of the specified class');

    // Overlapping events check
    const overlapping = await deps.eventRepository.findOverlappingEvents(cmd.class_id, startTime, endTime);
    if (overlapping.length > 0) {
      throw new ConflictError(
        'Event time conflicts with existing event for this class',
        overlapping.map(e => `Event: ${e.id?.toString()} (${e.startTime} - ${e.endTime})`)
      );
    }

    const location = new Location(cmd.location.latitude, cmd.location.longitude);
    const event = Event.create({
      classId: cmd.class_id,
      teacherId: cmd.teacher_id,
      startTime,
      endTime,
      location,
      status: 'active'
    });

    const saved = await deps.eventRepository.save(event);
    if (saved.id) {
      const qrToken = deps.tokenService.generateQRToken(
        saved.id.toString(),
        saved.classId,
        saved.teacherId,
        saved.endTime
      );
      saved.setQrToken(qrToken);
      return (await deps.eventRepository.update(saved)).toObject();
    }
    return saved.toObject();
  }
}

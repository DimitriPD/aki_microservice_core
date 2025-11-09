import { getDependencies } from '../../_shared/Dependencies';
import { EventId } from '../domain/value-objects/EventId';
import { EventStatus } from '../domain/value-objects/EventStatus';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppErrors';
import { logger } from '../../../shared/logger/Logger';

export interface UpdateEventCommand {
  eventId: string;
  startTime?: string;
  endTime?: string;
  status?: EventStatus;
}

export class UpdateEventHandler {
  async handle(cmd: UpdateEventCommand) {
    if (!cmd.eventId) throw new ValidationError('Event ID is required');
    const deps = getDependencies();
    const eventId = new EventId(cmd.eventId);
    const existingEvent = await deps.eventRepository.findById(eventId);
    if (!existingEvent) throw new NotFoundError('Event not found');
    if (existingEvent.status === 'canceled') throw new ValidationError('Cannot update a canceled event');

    let newStartTime = existingEvent.startTime;
    let newEndTime = existingEvent.endTime;

    if (cmd.startTime) newStartTime = new Date(cmd.startTime);
    if (cmd.endTime) newEndTime = new Date(cmd.endTime);

    if (cmd.startTime || cmd.endTime) {
      if (newStartTime >= newEndTime) throw new ValidationError('Start time must be before end time');
      const overlapping = await deps.eventRepository.findOverlappingEvents(
        existingEvent.classId,
        newStartTime,
        newEndTime,
        eventId
      );
      if (overlapping.length > 0) throw new ValidationError('Event time conflicts with existing event');
      existingEvent.updateTime(newStartTime, newEndTime);
    }

    if (cmd.status) existingEvent.updateStatus(cmd.status);

    const updated = await deps.eventRepository.update(existingEvent);
    logger.info('Event updated', {
      eventId: updated.id?.toString(),
      changes: { startTime: cmd.startTime, endTime: cmd.endTime, status: cmd.status }
    });
    return updated.toObject();
  }
}

import { getDependencies } from '../../_shared/Dependencies';
import { EventId } from '../domain/value-objects/EventId';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppErrors';
import { logger } from '../../../shared/logger/Logger';

export class DeleteEventHandler {
  async handle(eventId: string) {
    if (!eventId) throw new ValidationError('Event ID is required');
    const deps = getDependencies();
    const eventIdObj = new EventId(eventId);
    const existingEvent = await deps.eventRepository.findById(eventIdObj);
    if (!existingEvent) throw new NotFoundError('Event not found');
    if (!existingEvent.canBeDeleted()) throw new ValidationError('Cannot delete closed event or event with attendances');
    await deps.eventRepository.delete(eventIdObj);
    logger.info('Event deleted', { eventId, classId: existingEvent.classId, teacherId: existingEvent.teacherId });
  }
}

import { getDependencies } from '../../_shared/Dependencies';
import { EventId } from '../domain/value-objects/EventId';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppErrors';

export class GetEventHandler {
  async handle(eventId: string) {
    if (!eventId) throw new ValidationError('Event ID is required');
    const deps = getDependencies();
    const id = new EventId(eventId);
    const event = await deps.eventRepository.findById(id);
    if (!event) throw new NotFoundError('Event not found');
    return event.toObject();
  }
}

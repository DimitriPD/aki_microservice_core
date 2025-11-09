import { getDependencies } from '../../_shared/Dependencies';
import { ValidationError } from '../../../shared/errors/AppErrors';
import { EventId } from '../domain/value-objects/EventId';

export class GetEventQrHandler {
  async handle(eventId: string) {
    if (!eventId) throw new ValidationError('Event ID is required');
    const deps = getDependencies();
    const id = new EventId(eventId);
    const event = await deps.eventRepository.findById(id);
    if (!event) throw new ValidationError('Event not found');
    if (!event.qrToken) throw new ValidationError('QR token not available for this event');
    return { qr_token: event.qrToken, expires_at: event.endTime };
  }
}

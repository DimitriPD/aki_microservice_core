import { getDependencies } from '../../_shared/Dependencies';
import { ValidationError, NotFoundError } from '../../../shared/errors/AppErrors';
import { EventId } from '../domain/value-objects/EventId';
import { logger } from '../../../shared/logger/Logger';

export class GetEventByQrHandler {
  async handle(qrToken: string) {
    if (!qrToken) throw new ValidationError('QR token is required');
    const deps = getDependencies();
    logger.info('Getting event by QR token');
    let tokenPayload;
    try {
      tokenPayload = deps.tokenService.verifyQRToken(qrToken);
    } catch (error) {
      logger.warn('Invalid QR token provided', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new ValidationError('Invalid or expired QR token');
    }
    const eventId = new EventId(tokenPayload.eventId);
    const event = await deps.eventRepository.findById(eventId);
    if (!event) throw new NotFoundError('Event not found');
    logger.info('Event retrieved by QR token', { eventId: event.id?.toString(), classId: event.classId });
    return event.toObject();
  }
}

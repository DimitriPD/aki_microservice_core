import { Event } from '../../../domain/entities/Event';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { ValidationError, NotFoundError } from '../../../shared/errors/AppErrors';
import { TokenService } from '../../../shared/utils/TokenService';
import { EventId } from '../../../domain/value-objects/CommonTypes';
import { logger } from '../../../shared/logger/Logger';

export class GetEventByQrUseCase {
  constructor(
    private eventRepository: IEventRepository,
    private tokenService: TokenService
  ) {}

  async execute(qrToken: string): Promise<Event> {
    logger.info('Getting event by QR token');

    // Validate and decode QR token
    let tokenPayload;
    try {
      tokenPayload = this.tokenService.verifyQRToken(qrToken);
    } catch (error) {
      logger.warn('Invalid QR token provided', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new ValidationError('Invalid or expired QR token');
    }

    // Get event by ID from token
    const eventId = new EventId(tokenPayload.eventId);
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    logger.info('Event retrieved by QR token', { 
      eventId: event.id?.toString(),
      classId: event.classId 
    });

    return event;
  }
}

import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { EventId } from '../../../domain/value-objects/CommonTypes';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppErrors';
import { logger } from '../../../shared/logger/Logger';

export class DeleteEventUseCase {
  constructor(
    private eventRepository: IEventRepository
  ) {}

  async execute(eventId: string): Promise<void> {
    try {
      // Validate event ID
      if (!eventId) {
        throw new ValidationError('Event ID is required');
      }

      // Get existing event
      const eventIdObj = new EventId(eventId);
      const existingEvent = await this.eventRepository.findById(eventIdObj);
      if (!existingEvent) {
        throw new NotFoundError('Event not found');
      }

      // Check if event can be deleted
      if (!existingEvent.canBeDeleted()) {
        throw new ValidationError('Cannot delete closed event or event with attendances');
      }

      // Delete event
      await this.eventRepository.delete(eventIdObj);

      logger.info('Event deleted', {
        eventId: eventId,
        classId: existingEvent.classId,
        teacherId: existingEvent.teacherId
      });
    } catch (error) {
      logger.error('Failed to delete event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        eventId: eventId
      });
      throw error;
    }
  }
}
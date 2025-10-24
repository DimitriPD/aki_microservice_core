import { Event } from '../../../domain/entities/Event';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { EventStatus, EventId } from '../../../domain/value-objects/CommonTypes';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppErrors';
import { logger } from '../../../shared/logger/Logger';

export interface UpdateEventRequest {
  eventId: string;
  startTime?: Date;
  endTime?: Date;
  status?: EventStatus;
}

export class UpdateEventUseCase {
  constructor(
    private eventRepository: IEventRepository
  ) {}

  async execute(request: UpdateEventRequest): Promise<Event> {
    try {
      // Validate event ID
      if (!request.eventId) {
        throw new ValidationError('Event ID is required');
      }

      // Get existing event
      const eventId = new EventId(request.eventId);
      const existingEvent = await this.eventRepository.findById(eventId);
      if (!existingEvent) {
        throw new NotFoundError('Event not found');
      }

      // Check if event can be updated
      if (existingEvent.status === 'canceled') {
        throw new ValidationError('Cannot update a canceled event');
      }

      // Update event using business methods
      if (request.startTime || request.endTime) {
        const newStartTime = request.startTime || existingEvent.startTime;
        const newEndTime = request.endTime || existingEvent.endTime;
        
        // Validate time range
        if (newStartTime >= newEndTime) {
          throw new ValidationError('Start time must be before end time');
        }

        // Check for overlapping events
        const overlappingEvents = await this.eventRepository.findOverlappingEvents(
          existingEvent.classId,
          newStartTime,
          newEndTime,
          eventId
        );

        if (overlappingEvents.length > 0) {
          throw new ValidationError('Event time conflicts with existing event');
        }

        // Update time using business method
        existingEvent.updateTime(newStartTime, newEndTime);
      }

      // Update status if provided
      if (request.status) {
        existingEvent.updateStatus(request.status);
      }

      // Save updated event
      const updatedEvent = await this.eventRepository.update(existingEvent);

      logger.info('Event updated', {
        eventId: updatedEvent.id?.toString(),
        changes: {
          startTime: request.startTime,
          endTime: request.endTime,
          status: request.status
        }
      });

      return updatedEvent;
    } catch (error) {
      logger.error('Failed to update event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        eventId: request.eventId
      });
      throw error;
    }
  }
}
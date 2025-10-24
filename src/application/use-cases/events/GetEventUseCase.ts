import { Event } from '../../../domain/entities/Event';
import { EventId } from '../../../domain/value-objects/CommonTypes';
import { IEventRepository } from '../../../domain/repositories/IEventRepository';
import { NotFoundError } from '../../../shared/errors/AppErrors';

export class GetEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(eventId: string): Promise<Event> {
    const id = new EventId(eventId);
    const event = await this.eventRepository.findById(id);
    
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    return event;
  }
}
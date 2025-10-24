import { Event } from '../../../domain/entities/Event';
import { EventStatus } from '../../../domain/value-objects/CommonTypes';
import { 
  IEventRepository, 
  EventFilters, 
  PaginationOptions, 
  PaginatedResult 
} from '../../../domain/repositories/IEventRepository';

export interface ListEventsRequest {
  page?: number;
  size?: number;
  classId?: number;
  teacherId?: number;
  status?: EventStatus;
}

export class ListEventsUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(request: ListEventsRequest): Promise<PaginatedResult<Event>> {
    const pagination: PaginationOptions = {
      page: request.page || 1,
      size: Math.min(request.size || 50, 200) // Max 200 items per page
    };

    const filters: EventFilters = {};
    if (request.classId !== undefined) {
      filters.classId = request.classId;
    }
    if (request.teacherId !== undefined) {
      filters.teacherId = request.teacherId;
    }
    if (request.status !== undefined) {
      filters.status = request.status;
    }

    return await this.eventRepository.findAll(filters, pagination);
  }
}
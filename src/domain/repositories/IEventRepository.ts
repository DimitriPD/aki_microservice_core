import { Event } from '../entities/Event';
import { EventId, EventStatus } from '../value-objects/CommonTypes';

export interface EventFilters {
  classId?: number;
  teacherId?: number;
  status?: EventStatus;
}

export interface PaginationOptions {
  page: number;
  size: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    page: number;
    size: number;
    total: number;
  };
}

export interface IEventRepository {
  save(event: Event): Promise<Event>;
  findById(id: EventId): Promise<Event | null>;
  findAll(filters: EventFilters, pagination: PaginationOptions): Promise<PaginatedResult<Event>>;
  findOverlappingEvents(classId: number, startTime: Date, endTime: Date, excludeId?: EventId): Promise<Event[]>;
  update(event: Event): Promise<Event>;
  delete(id: EventId): Promise<void>;
  exists(id: EventId): Promise<boolean>;
}
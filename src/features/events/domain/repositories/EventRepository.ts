import { Event } from '../entities/Event';
import { EventId } from '../value-objects/EventId';
import { EventStatus } from '../value-objects/EventStatus';

export interface EventFilters { classId?: number; teacherId?: number; status?: EventStatus; }
export interface PaginationOptions { page: number; size: number; }
export interface PaginatedResult<T> { items: T[]; meta: { page: number; size: number; total: number; }; }

export interface EventRepository {
  save(event: Event): Promise<Event>;
  findById(id: EventId): Promise<Event | null>;
  findAll(filters: EventFilters, pagination: PaginationOptions): Promise<PaginatedResult<Event>>;
  findOverlappingEvents(classId: number, startTime: Date, endTime: Date, excludeId?: EventId): Promise<Event[]>;
  update(event: Event): Promise<Event>;
  delete(id: EventId): Promise<void>;
  exists(id: EventId): Promise<boolean>;
}

import { getDependencies } from '../../_shared/Dependencies';
import { EventStatus } from '../domain/value-objects/EventStatus';
import { Event } from '../domain/entities/Event';

export interface ListEventsQuery {
  page?: number;
  size?: number;
  classId?: number;
  teacherId?: number;
  status?: EventStatus;
}

export class ListEventsHandler {
  async handle(query: ListEventsQuery) {
    const deps = getDependencies();
    const pagination = {
      page: query.page || 1,
      size: Math.min(query.size || 50, 200)
    };
    const filters: any = {};
    if (query.classId !== undefined) filters.classId = query.classId;
    if (query.teacherId !== undefined) filters.teacherId = query.teacherId;
    if (query.status !== undefined) filters.status = query.status;

    const result = await deps.eventRepository.findAll(filters, pagination);
    return {
      items: result.items.map((e: Event) => e.toObject()),
      meta: result.meta
    };
  }
}

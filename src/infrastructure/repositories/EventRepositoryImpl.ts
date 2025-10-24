import { Event } from '../../domain/entities/Event';
import { EventId, EventStatus } from '../../domain/value-objects/CommonTypes';
import { Location } from '../../domain/value-objects/Location';
import { 
  IEventRepository, 
  EventFilters, 
  PaginationOptions, 
  PaginatedResult 
} from '../../domain/repositories/IEventRepository';
import { EventModel, IEventDocument } from '../database/models/EventModel';
import { NotFoundError, ConflictError } from '../../shared/errors/AppErrors';

export class EventRepositoryImpl implements IEventRepository {
  async save(event: Event): Promise<Event> {
    try {
      const eventData = this.mapToDocument(event);
      const savedDocument = await EventModel.create(eventData);
      return this.mapToDomain(savedDocument);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError('Event time conflicts with existing event for this class');
      }
      throw error;
    }
  }

  async findById(id: EventId): Promise<Event | null> {
    const document = await EventModel.findById(id.toString());
    return document ? this.mapToDomain(document) : null;
  }

  async findAll(filters: EventFilters, pagination: PaginationOptions): Promise<PaginatedResult<Event>> {
    const query = this.buildQuery(filters);
    const skip = (pagination.page - 1) * pagination.size;

    const [documents, total] = await Promise.all([
      EventModel.find(query)
        .sort({ start_time: -1 })
        .skip(skip)
        .limit(pagination.size),
      EventModel.countDocuments(query)
    ]);

    return {
      items: documents.map(doc => this.mapToDomain(doc)),
      meta: {
        page: pagination.page,
        size: pagination.size,
        total
      }
    };
  }

  async findOverlappingEvents(
    classId: number, 
    startTime: Date, 
    endTime: Date, 
    excludeId?: EventId
  ): Promise<Event[]> {
    const query: any = {
      class_id: classId,
      status: { $ne: 'canceled' },
      $and: [
        { start_time: { $lt: endTime } },
        { end_time: { $gt: startTime } }
      ]
    };

    if (excludeId) {
      query._id = { $ne: excludeId.toString() };
    }

    const documents = await EventModel.find(query);
    return documents.map(doc => this.mapToDomain(doc));
  }

  async update(event: Event): Promise<Event> {
    if (!event.id) {
      throw new Error('Event ID is required for update');
    }

    const eventData = this.mapToDocument(event);
    const updatedDocument = await EventModel.findByIdAndUpdate(
      event.id.toString(),
      eventData,
      { new: true, runValidators: true }
    );

    if (!updatedDocument) {
      throw new NotFoundError('Event not found');
    }

    return this.mapToDomain(updatedDocument);
  }

  async delete(id: EventId): Promise<void> {
    const result = await EventModel.findByIdAndDelete(id.toString());
    if (!result) {
      throw new NotFoundError('Event not found');
    }
  }

  async exists(id: EventId): Promise<boolean> {
    const count = await EventModel.countDocuments({ _id: id.toString() });
    return count > 0;
  }

  private buildQuery(filters: EventFilters): Record<string, any> {
    const query: Record<string, any> = {};

    if (filters.classId) {
      query.class_id = filters.classId;
    }

    if (filters.teacherId) {
      query.teacher_id = filters.teacherId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    return query;
  }

  private mapToDocument(event: Event): Partial<IEventDocument> {
    const doc: any = {
      class_id: event.classId,
      teacher_id: event.teacherId,
      start_time: event.startTime,
      end_time: event.endTime,
      location: {
        latitude: event.location.latitude,
        longitude: event.location.longitude
      },
      status: event.status,
      updated_at: new Date()
    };
    
    if (event.qrToken) {
      doc.qr_token = event.qrToken;
    }
    
    return doc;
  }

  private mapToDomain(document: IEventDocument): Event {
    const eventData: any = {
      id: new EventId((document as any)._id.toString()),
      classId: document.class_id,
      teacherId: document.teacher_id,
      startTime: document.start_time,
      endTime: document.end_time,
      location: new Location(document.location.latitude, document.location.longitude),
      status: document.status,
      createdAt: document.created_at,
      updatedAt: document.updated_at
    };
    
    if (document.qr_token) {
      eventData.qrToken = document.qr_token;
    }
    
    return Event.fromPersistence(eventData);
  }
}
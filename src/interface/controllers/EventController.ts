import { Request, Response, NextFunction } from 'express';
import { CreateEventUseCase } from '../../application/use-cases/events/CreateEventUseCase';
import { GetEventUseCase } from '../../application/use-cases/events/GetEventUseCase';
import { ListEventsUseCase } from '../../application/use-cases/events/ListEventsUseCase';
import { UpdateEventUseCase } from '../../application/use-cases/events/UpdateEventUseCase';
import { DeleteEventUseCase } from '../../application/use-cases/events/DeleteEventUseCase';
import { EventStatus } from '../../domain/value-objects/CommonTypes';
import { ValidationError } from '../../shared/errors/AppErrors';
import { logger } from '../../shared/logger/Logger';

export class EventController {
  constructor(
    private createEventUseCase: CreateEventUseCase,
    private getEventUseCase: GetEventUseCase,
    private listEventsUseCase: ListEventsUseCase,
    private updateEventUseCase: UpdateEventUseCase,
    private deleteEventUseCase: DeleteEventUseCase
  ) {}

  async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { class_id, teacher_id, start_time, end_time, location } = req.body;

      // Validate required fields
      if (!class_id || !teacher_id || !start_time || !end_time || !location) {
        throw new ValidationError('Missing required fields: class_id, teacher_id, start_time, end_time, location');
      }

      const event = await this.createEventUseCase.execute({
        classId: class_id,
        teacherId: teacher_id,
        startTime: new Date(start_time),
        endTime: new Date(end_time),
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      });

      logger.info('Event created', { eventId: event.id?.toString() });

      res.status(201).json({
        data: event.toObject(),
        message: 'Event created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId } = req.params;

      if (!eventId) {
        throw new ValidationError('Event ID is required');
      }

      const event = await this.getEventUseCase.execute(eventId);

      res.json({
        data: event.toObject(),
        message: 'Event retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = '1',
        size = '50',
        class_id,
        teacher_id,
        status
      } = req.query;

      const request: any = {
        page: parseInt(page as string, 10),
        size: parseInt(size as string, 10)
      };
      
      if (class_id) {
        request.classId = parseInt(class_id as string, 10);
      }
      if (teacher_id) {
        request.teacherId = parseInt(teacher_id as string, 10);
      }
      if (status) {
        request.status = status as EventStatus;
      }

      const result = await this.listEventsUseCase.execute(request);

      res.json({
        data: result.items.map(event => event.toObject()),
        meta: result.meta,
        message: 'Events retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getEventQr(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId } = req.params;

      if (!eventId) {
        throw new ValidationError('Event ID is required');
      }

      const event = await this.getEventUseCase.execute(eventId);

      if (!event.qrToken) {
        throw new ValidationError('QR token not available for this event');
      }

      res.json({
        data: {
          qr_token: event.qrToken,
          expires_at: event.endTime
        },
        message: 'QR token retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId } = req.params;
      const { start_time, end_time, status } = req.body;

      if (!eventId) {
        throw new ValidationError('Event ID is required');
      }

      const updateRequest: any = {
        eventId
      };

      if (start_time) {
        updateRequest.startTime = new Date(start_time);
      }
      if (end_time) {
        updateRequest.endTime = new Date(end_time);
      }
      if (status) {
        updateRequest.status = status as EventStatus;
      }

      const updatedEvent = await this.updateEventUseCase.execute(updateRequest);

      logger.info('Event updated via API', { eventId });

      res.json({
        data: updatedEvent.toObject(),
        message: 'Event updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { eventId } = req.params;

      if (!eventId) {
        throw new ValidationError('Event ID is required');
      }

      await this.deleteEventUseCase.execute(eventId);

      logger.info('Event deleted via API', { eventId });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
import { EventId } from '../value-objects/EventId';
import { EventStatus } from '../value-objects/EventStatus';
import { Location } from '../value-objects/Location';

export interface EventProps {
  id?: EventId;
  classId: number;
  teacherId: number;
  startTime: Date;
  endTime: Date;
  location: Location;
  qrToken?: string;
  status: EventStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Event {
  private constructor(private props: EventProps) { this.validate(); }

  static create(props: Omit<EventProps, 'id' | 'createdAt' | 'updatedAt'>): Event {
    const now = new Date();
    return new Event({ ...props, createdAt: now, updatedAt: now, status: props.status || 'active' });
  }
  static fromPersistence(props: EventProps): Event { return new Event(props); }

  private validate(): void {
    if (this.props.classId <= 0) throw new Error('Class ID must be a positive number');
    if (this.props.teacherId <= 0) throw new Error('Teacher ID must be a positive number');
    if (this.props.startTime >= this.props.endTime) throw new Error('Start time must be before end time');
    if (this.props.startTime < new Date() && !this.props.id) throw new Error('Cannot create events in the past');
  }

  get id(): EventId | undefined { return this.props.id; }
  get classId(): number { return this.props.classId; }
  get teacherId(): number { return this.props.teacherId; }
  get startTime(): Date { return this.props.startTime; }
  get endTime(): Date { return this.props.endTime; }
  get location(): Location { return this.props.location; }
  get qrToken(): string | undefined { return this.props.qrToken; }
  get status(): EventStatus { return this.props.status; }
  get createdAt(): Date | undefined { return this.props.createdAt; }
  get updatedAt(): Date | undefined { return this.props.updatedAt; }

  updateTime(startTime: Date, endTime: Date): void {
    if (this.props.status === 'closed') throw new Error('Cannot update time of closed event');
    if (startTime >= endTime) throw new Error('Start time must be before end time');
    this.props.startTime = startTime; this.props.endTime = endTime; this.props.updatedAt = new Date();
  }
  updateStatus(status: EventStatus): void { if (this.props.status === 'closed' && status !== 'closed') throw new Error('Cannot reopen closed event'); this.props.status = status; this.props.updatedAt = new Date(); }
  setQrToken(token: string): void { this.props.qrToken = token; this.props.updatedAt = new Date(); }
  close(): void { this.updateStatus('closed'); }
  cancel(): void { if (this.props.status === 'closed') throw new Error('Cannot cancel closed event'); this.updateStatus('canceled'); }
  isActive(): boolean { return this.props.status === 'active'; }
  isClosed(): boolean { return this.props.status === 'closed'; }
  isCanceled(): boolean { return this.props.status === 'canceled'; }
  isOverlapping(other: Event): boolean { if (this.props.classId !== other.classId) return false; return this.props.startTime < other.endTime && this.props.endTime > other.startTime; }
  canBeDeleted(): boolean { return this.props.status !== 'closed'; }
  toObject(): Record<string, any> { return { id: this.props.id?.toString(), class_id: this.props.classId, teacher_id: this.props.teacherId, start_time: this.props.startTime, end_time: this.props.endTime, location: this.props.location.toObject(), qr_token: this.props.qrToken, status: this.props.status, created_at: this.props.createdAt, updated_at: this.props.updatedAt }; }
}

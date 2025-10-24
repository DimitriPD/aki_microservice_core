import { AttendanceId, AttendanceStatus } from '../value-objects/CommonTypes';
import { Location } from '../value-objects/Location';
import { ValidationResult } from '../value-objects/ValidationResult';

export interface AttendanceProps {
  id?: AttendanceId;
  eventId: string;
  studentId: number;
  status: AttendanceStatus;
  timestamp: Date;
  location?: Location;
  validation?: ValidationResult;
  createdBy: string;
  createdAt?: Date;
}

export class Attendance {
  private constructor(private props: AttendanceProps) {
    this.validate();
  }

  static create(props: Omit<AttendanceProps, 'id' | 'createdAt'>): Attendance {
    return new Attendance({
      ...props,
      createdAt: new Date(),
      createdBy: props.createdBy || 'system'
    });
  }

  static fromPersistence(props: AttendanceProps): Attendance {
    return new Attendance(props);
  }

  private validate(): void {
    if (!this.props.eventId || this.props.eventId.trim().length === 0) {
      throw new Error('Event ID is required');
    }
    if (this.props.studentId <= 0) {
      throw new Error('Student ID must be a positive number');
    }
    if (!this.props.createdBy || this.props.createdBy.trim().length === 0) {
      throw new Error('Created by is required');
    }
  }

  // Getters
  get id(): AttendanceId | undefined {
    return this.props.id;
  }

  get eventId(): string {
    return this.props.eventId;
  }

  get studentId(): number {
    return this.props.studentId;
  }

  get status(): AttendanceStatus {
    return this.props.status;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  get location(): Location | undefined {
    return this.props.location;
  }

  get validation(): ValidationResult | undefined {
    return this.props.validation;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  // Business methods
  updateStatus(status: AttendanceStatus, updatedBy: string, note?: string): void {
    this.props.status = status;
    this.props.createdBy = updatedBy;
  }

  markAsManual(updatedBy: string): void {
    this.updateStatus('manual', updatedBy);
  }

  markAsRetroactive(updatedBy: string): void {
    this.updateStatus('retroactive', updatedBy);
  }

  markAsInvalid(updatedBy: string): void {
    this.updateStatus('invalid', updatedBy);
  }

  isRecorded(): boolean {
    return this.props.status === 'recorded';
  }

  isManual(): boolean {
    return this.props.status === 'manual';
  }

  isRetroactive(): boolean {
    return this.props.status === 'retroactive';
  }

  isInvalid(): boolean {
    return this.props.status === 'invalid';
  }

  isWithinRadius(): boolean {
    return this.props.validation?.withinRadius || false;
  }

  getDistanceInMeters(): number {
    return this.props.validation?.distanceMeters || 0;
  }

  toObject(): Record<string, any> {
    return {
      id: this.props.id?.toString(),
      event_id: this.props.eventId,
      student_id: this.props.studentId,
      status: this.props.status,
      timestamp: this.props.timestamp,
      location: this.props.location?.toObject(),
      validation: this.props.validation?.toObject(),
      created_by: this.props.createdBy,
      created_at: this.props.createdAt
    };
  }
}
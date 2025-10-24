export type EventStatus = 'active' | 'closed' | 'canceled';
export type AttendanceStatus = 'recorded' | 'manual' | 'retroactive' | 'invalid';
export type OccurrenceType = 'student_not_in_class' | 'manual_note' | 'invalid_qr' | 'duplicate_scan';

export class EventId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Event ID cannot be empty');
    }
  }

  equals(other: EventId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

export class AttendanceId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Attendance ID cannot be empty');
    }
  }

  equals(other: AttendanceId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

export class OccurrenceId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Occurrence ID cannot be empty');
    }
  }

  equals(other: OccurrenceId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
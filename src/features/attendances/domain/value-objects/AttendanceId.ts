export class AttendanceId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) throw new Error('Attendance ID cannot be empty');
  }
  equals(other: AttendanceId): boolean { return this.value === other.value; }
  toString(): string { return this.value; }
}

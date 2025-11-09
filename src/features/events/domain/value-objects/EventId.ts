export class EventId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Event ID cannot be empty');
    }
  }
  equals(other: EventId): boolean { return this.value === other.value; }
  toString(): string { return this.value; }
}

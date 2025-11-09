export class OccurrenceId {
  constructor(public readonly value: string) { if (!value || value.trim().length === 0) throw new Error('Occurrence ID cannot be empty'); }
  equals(other: OccurrenceId): boolean { return this.value === other.value; }
  toString(): string { return this.value; }
}

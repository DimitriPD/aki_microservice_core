import { Occurrence } from '../entities/Occurrence';
import { OccurrenceId } from '../value-objects/OccurrenceId';
import { OccurrenceType } from '../value-objects/OccurrenceType';

export interface OccurrenceFilters { classId?: number; teacherId?: number; type?: OccurrenceType; studentCpf?: string; }
export interface PaginationOptions { page: number; size: number; }
export interface PaginatedResult<T> { items: T[]; meta: { page: number; size: number; total: number; }; }

export interface OccurrenceRepository {
  save(occurrence: Occurrence): Promise<Occurrence>;
  findById(id: OccurrenceId): Promise<Occurrence | null>;
  findAll(filters: OccurrenceFilters, pagination: PaginationOptions): Promise<PaginatedResult<Occurrence>>;
  update(occurrence: Occurrence): Promise<Occurrence>;
  delete(id: OccurrenceId): Promise<void>;
  exists(id: OccurrenceId): Promise<boolean>;
  findUnnotified(): Promise<Occurrence[]>;
}

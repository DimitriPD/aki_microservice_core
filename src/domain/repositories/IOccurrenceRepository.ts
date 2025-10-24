import { Occurrence } from '../entities/Occurrence';
import { OccurrenceId, OccurrenceType } from '../value-objects/CommonTypes';

export interface OccurrenceFilters {
  classId?: number;
  teacherId?: number;
  type?: OccurrenceType;
  studentCpf?: string;
}

export interface PaginationOptions {
  page: number;
  size: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    page: number;
    size: number;
    total: number;
  };
}

export interface IOccurrenceRepository {
  save(occurrence: Occurrence): Promise<Occurrence>;
  findById(id: OccurrenceId): Promise<Occurrence | null>;
  findAll(filters: OccurrenceFilters, pagination: PaginationOptions): Promise<PaginatedResult<Occurrence>>;
  update(occurrence: Occurrence): Promise<Occurrence>;
  delete(id: OccurrenceId): Promise<void>;
  exists(id: OccurrenceId): Promise<boolean>;
  findUnnotified(): Promise<Occurrence[]>;
}
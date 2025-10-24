import { Attendance } from '../entities/Attendance';
import { AttendanceId, AttendanceStatus } from '../value-objects/CommonTypes';

export interface AttendanceFilters {
  eventId?: string;
  studentId?: number;
  status?: AttendanceStatus;
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

export interface IAttendanceRepository {
  save(attendance: Attendance): Promise<Attendance>;
  findById(id: AttendanceId): Promise<Attendance | null>;
  findAll(filters: AttendanceFilters, pagination: PaginationOptions): Promise<PaginatedResult<Attendance>>;
  findByEventAndStudent(eventId: string, studentId: number): Promise<Attendance | null>;
  update(attendance: Attendance): Promise<Attendance>;
  delete(id: AttendanceId): Promise<void>;
  exists(id: AttendanceId): Promise<boolean>;
  existsByEventAndStudent(eventId: string, studentId: number): Promise<boolean>;
}
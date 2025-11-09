import { Attendance } from '../domain/entities/Attendance';
import { AttendanceId } from '../domain/value-objects/AttendanceId';
import { Location } from '../domain/value-objects/Location';
import { ValidationResult } from '../domain/value-objects/ValidationResult';
import { AttendanceRepository, AttendanceFilters, PaginationOptions, PaginatedResult } from '../domain/repositories/AttendanceRepository';
import { AttendanceModel, IAttendanceDocument } from './models/AttendanceModel';
import { NotFoundError, ConflictError } from '../../../shared/errors/AppErrors';

export class AttendanceRepositoryImpl implements AttendanceRepository {
  async save(attendance: Attendance): Promise<Attendance> {
    try {
      const attendanceData = this.mapToDocument(attendance);
      const savedDocument = await AttendanceModel.create(attendanceData);
      return this.mapToDomain(savedDocument);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError('Attendance already exists for this student and event');
      }
      throw error;
    }
  }
  async findById(id: AttendanceId): Promise<Attendance | null> { const document = await AttendanceModel.findById(id.toString()); return document ? this.mapToDomain(document) : null; }
  async findAll(filters: AttendanceFilters, pagination: PaginationOptions): Promise<PaginatedResult<Attendance>> {
    const query = this.buildQuery(filters);
    const skip = (pagination.page - 1) * pagination.size;
    const [documents, total] = await Promise.all([
      AttendanceModel.find(query).sort({ timestamp: -1 }).skip(skip).limit(pagination.size),
      AttendanceModel.countDocuments(query)
    ]);
    return { items: documents.map(doc => this.mapToDomain(doc)), meta: { page: pagination.page, size: pagination.size, total } };
  }
  async findByEventAndStudent(eventId: string, studentId: number): Promise<Attendance | null> { const document = await AttendanceModel.findOne({ event_id: eventId, student_id: studentId }); return document ? this.mapToDomain(document) : null; }
  async update(attendance: Attendance): Promise<Attendance> {
    if (!attendance.id) throw new Error('Attendance ID is required for update');
    const attendanceData = this.mapToDocument(attendance);
    const updatedDocument = await AttendanceModel.findByIdAndUpdate(attendance.id.toString(), attendanceData, { new: true, runValidators: true });
    if (!updatedDocument) throw new NotFoundError('Attendance not found');
    return this.mapToDomain(updatedDocument);
  }
  async delete(id: AttendanceId): Promise<void> { const result = await AttendanceModel.findByIdAndDelete(id.toString()); if (!result) throw new NotFoundError('Attendance not found'); }
  async exists(id: AttendanceId): Promise<boolean> { const count = await AttendanceModel.countDocuments({ _id: id.toString() }); return count > 0; }
  async existsByEventAndStudent(eventId: string, studentId: number): Promise<boolean> { const count = await AttendanceModel.countDocuments({ event_id: eventId, student_id: studentId }); return count > 0; }

  private buildQuery(filters: AttendanceFilters): Record<string, any> { const query: Record<string, any> = {}; if (filters.eventId) query.event_id = filters.eventId; if (filters.studentId) query.student_id = filters.studentId; if (filters.status) query.status = filters.status; return query; }

  private mapToDocument(attendance: Attendance): Partial<IAttendanceDocument> {
    return { event_id: attendance.eventId as any, student_id: attendance.studentId, status: attendance.status, timestamp: attendance.timestamp, location: attendance.location ? { latitude: attendance.location.latitude, longitude: attendance.location.longitude } : undefined, validation: attendance.validation ? { within_radius: attendance.validation.withinRadius, distance_meters: attendance.validation.distanceMeters } : undefined, created_by: attendance.createdBy };
  }
  private mapToDomain(document: IAttendanceDocument): Attendance {
    return Attendance.fromPersistence({ id: new AttendanceId((document as any)._id.toString()), eventId: document.event_id.toString(), studentId: document.student_id, status: document.status, timestamp: document.timestamp, location: document.location ? new Location(document.location.latitude, document.location.longitude) : undefined, validation: document.validation ? ValidationResult.create(document.validation.within_radius, document.validation.distance_meters) : undefined, createdBy: document.created_by, createdAt: document.created_at });
  }
}

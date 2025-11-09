import { Occurrence } from '../domain/entities/Occurrence';
import { OccurrenceId } from '../domain/value-objects/OccurrenceId';
import { OccurrenceRepository, OccurrenceFilters, PaginationOptions, PaginatedResult } from '../domain/repositories/OccurrenceRepository';
import { OccurrenceModel, IOccurrenceDocument } from './models/OccurrenceModel';
import { NotFoundError } from '../../../shared/errors/AppErrors';

export class OccurrenceRepositoryImpl implements OccurrenceRepository {
  async save(occurrence: Occurrence): Promise<Occurrence> { const docData = this.mapToDocument(occurrence); const saved = await OccurrenceModel.create(docData); return this.mapToDomain(saved); }
  async findById(id: OccurrenceId): Promise<Occurrence | null> { const doc = await OccurrenceModel.findById(id.toString()); return doc ? this.mapToDomain(doc) : null; }
  async findAll(filters: OccurrenceFilters, pagination: PaginationOptions): Promise<PaginatedResult<Occurrence>> {
    const query = this.buildQuery(filters); const skip = (pagination.page - 1) * pagination.size;
    const [docs, total] = await Promise.all([ OccurrenceModel.find(query).sort({ created_at: -1 }).skip(skip).limit(pagination.size), OccurrenceModel.countDocuments(query) ]);
    return { items: docs.map(d => this.mapToDomain(d)), meta: { page: pagination.page, size: pagination.size, total } };
  }
  async update(occurrence: Occurrence): Promise<Occurrence> { if (!occurrence.id) throw new Error('Occurrence ID required for update'); const docData = this.mapToDocument(occurrence); const updated = await OccurrenceModel.findByIdAndUpdate(occurrence.id.toString(), docData, { new: true, runValidators: true }); if (!updated) throw new NotFoundError('Occurrence not found'); return this.mapToDomain(updated); }
  async delete(id: OccurrenceId): Promise<void> { const deleted = await OccurrenceModel.findByIdAndDelete(id.toString()); if (!deleted) throw new NotFoundError('Occurrence not found'); }
  async exists(id: OccurrenceId): Promise<boolean> { const count = await OccurrenceModel.countDocuments({ _id: id.toString() }); return count > 0; }
  async findUnnotified(): Promise<Occurrence[]> { const docs = await OccurrenceModel.find({ notified_to_institution: false }); return docs.map(d => this.mapToDomain(d)); }

  private buildQuery(filters: OccurrenceFilters): Record<string, any> { const query: Record<string, any> = {}; if (filters.classId) query.class_id = filters.classId; if (filters.teacherId) query.teacher_id = filters.teacherId; if (filters.type) query.type = filters.type; if (filters.studentCpf) query.student_cpf = filters.studentCpf; return query; }
  private mapToDocument(occurrence: Occurrence): Partial<IOccurrenceDocument> { return { type: occurrence.type as any, teacher_id: occurrence.teacherId, student_cpf: occurrence.studentCpf, class_id: occurrence.classId, description: occurrence.description, notified_to_institution: occurrence.notifiedToInstitution }; }
  private mapToDomain(doc: IOccurrenceDocument): Occurrence { return Occurrence.fromPersistence({ id: new OccurrenceId((doc as any)._id.toString()), type: doc.type as any, teacherId: doc.teacher_id, studentCpf: doc.student_cpf, classId: doc.class_id, description: doc.description, createdAt: doc.created_at, notifiedToInstitution: doc.notified_to_institution }); }
}

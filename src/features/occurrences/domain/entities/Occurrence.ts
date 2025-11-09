import { OccurrenceId } from '../value-objects/OccurrenceId';
import { OccurrenceType } from '../value-objects/OccurrenceType';

export interface OccurrenceProps {
  id?: OccurrenceId;
  type: OccurrenceType;
  teacherId: number;
  studentCpf?: string;
  classId?: number;
  description: string;
  createdAt?: Date;
  notifiedToInstitution: boolean;
}

export class Occurrence {
  private constructor(private props: OccurrenceProps) { this.validate(); }
  static create(props: Omit<OccurrenceProps,'id'|'createdAt'>): Occurrence { return new Occurrence({ ...props, createdAt: new Date(), notifiedToInstitution: props.notifiedToInstitution || false }); }
  static fromPersistence(props: OccurrenceProps): Occurrence { return new Occurrence(props); }
  private validate(): void {
    if (this.props.teacherId <= 0) throw new Error('Teacher ID must be a positive number');
    if (!this.props.description || this.props.description.trim().length === 0) throw new Error('Description is required');
    if (this.props.type === 'student_not_in_class' && !this.props.studentCpf) throw new Error('Student CPF is required for student_not_in_class occurrences');
  }
  get id(): OccurrenceId | undefined { return this.props.id; }
  get type(): OccurrenceType { return this.props.type; }
  get teacherId(): number { return this.props.teacherId; }
  get studentCpf(): string | undefined { return this.props.studentCpf; }
  get classId(): number | undefined { return this.props.classId; }
  get description(): string { return this.props.description; }
  get createdAt(): Date | undefined { return this.props.createdAt; }
  get notifiedToInstitution(): boolean { return this.props.notifiedToInstitution; }
  markAsNotified(): void { this.props.notifiedToInstitution = true; }
  isStudentNotInClass(): boolean { return this.props.type === 'student_not_in_class'; }
  isManualNote(): boolean { return this.props.type === 'manual_note'; }
  isInvalidQr(): boolean { return this.props.type === 'invalid_qr'; }
  isDuplicateScan(): boolean { return this.props.type === 'duplicate_scan'; }
  requiresNotification(): boolean { return !this.props.notifiedToInstitution && (this.isStudentNotInClass() || this.isInvalidQr()); }
  toObject(): Record<string, any> { return { id: this.props.id?.toString(), type: this.props.type, teacher_id: this.props.teacherId, student_cpf: this.props.studentCpf, class_id: this.props.classId, description: this.props.description, created_at: this.props.createdAt, notified_to_institution: this.props.notifiedToInstitution }; }
}

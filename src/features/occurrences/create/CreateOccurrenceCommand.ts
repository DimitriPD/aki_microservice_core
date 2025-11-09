export interface CreateOccurrenceCommand {
  type: 'student_not_in_class' | 'manual_note' | 'invalid_qr' | 'duplicate_scan';
  teacher_id: number;
  student_cpf?: string;
  class_id?: number;
  description: string;
}

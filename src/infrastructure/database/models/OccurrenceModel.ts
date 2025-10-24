import mongoose, { Schema, Document } from 'mongoose';

export interface IOccurrenceDocument extends Document {
  type: 'student_not_in_class' | 'manual_note' | 'invalid_qr' | 'duplicate_scan';
  teacher_id: number;
  student_cpf?: string;
  class_id?: number;
  description: string;
  created_at: Date;
  notified_to_institution: boolean;
}

const OccurrenceSchema = new Schema<IOccurrenceDocument>({
  type: { 
    type: String, 
    enum: ['student_not_in_class', 'manual_note', 'invalid_qr', 'duplicate_scan'], 
    required: true,
    index: true
  },
  teacher_id: { 
    type: Number, 
    required: true,
    index: true
  },
  student_cpf: { 
    type: String,
    required: false,
    index: true,
    sparse: true
  },
  class_id: { 
    type: Number,
    required: false,
    index: true,
    sparse: true
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 1000
  },
  notified_to_institution: { 
    type: Boolean, 
    default: false,
    index: true
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: false
  },
  collection: 'occurrences'
});

// Compound indexes for better query performance
OccurrenceSchema.index({ class_id: 1, created_at: -1 });
OccurrenceSchema.index({ teacher_id: 1, created_at: -1 });
OccurrenceSchema.index({ type: 1, created_at: -1 });
OccurrenceSchema.index({ notified_to_institution: 1, created_at: -1 });

export const OccurrenceModel = mongoose.model<IOccurrenceDocument>('Occurrence', OccurrenceSchema);
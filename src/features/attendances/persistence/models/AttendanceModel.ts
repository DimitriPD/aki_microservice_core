import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceDocument extends Document {
  event_id: mongoose.Types.ObjectId;
  student_id: number;
  status: 'recorded' | 'manual' | 'retroactive' | 'invalid';
  timestamp: Date;
  location?: { latitude: number; longitude: number; };
  validation?: { within_radius: boolean; distance_meters: number; };
  created_by: string;
  created_at: Date;
}

const AttendanceSchema = new Schema<IAttendanceDocument>({
  event_id: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  student_id: { type: Number, required: true, index: true },
  status: { type: String, enum: ['recorded','manual','retroactive','invalid'], required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  location: { latitude: { type: Number, min: -90, max: 90 }, longitude: { type: Number, min: -180, max: 180 } },
  validation: { within_radius: { type: Boolean, default: false }, distance_meters: { type: Number, min: 0 } },
  created_by: { type: String, default: 'system', index: true }
},{ timestamps: { createdAt: 'created_at', updatedAt: false }, collection: 'attendances' });

AttendanceSchema.index({ event_id: 1, student_id: 1 }, { unique: true });
AttendanceSchema.index({ event_id: 1, timestamp: -1 });
AttendanceSchema.index({ student_id: 1, timestamp: -1 });
AttendanceSchema.index({ status: 1, created_at: -1 });

export const AttendanceModel = mongoose.model<IAttendanceDocument>('Attendance', AttendanceSchema);

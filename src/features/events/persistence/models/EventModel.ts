import mongoose, { Schema, Document } from 'mongoose';

export interface IEventDocument extends Document {
  class_id: number;
  teacher_id: number;
  start_time: Date;
  end_time: Date;
  location: { latitude: number; longitude: number; };
  qr_token?: string;
  status: 'active' | 'closed' | 'canceled';
  created_at: Date;
  updated_at: Date;
}

const EventSchema = new Schema<IEventDocument>({
  class_id: { type: Number, required: true, index: true },
  teacher_id: { type: Number, required: true, index: true },
  start_time: { type: Date, required: true, index: true },
  end_time: { type: Date, required: true },
  location: { latitude: { type: Number, required: true, min: -90, max: 90 }, longitude: { type: Number, required: true, min: -180, max: 180 } },
  qr_token: { type: String },
  status: { type: String, enum: ['active','closed','canceled'], default: 'active', index: true }
},{ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'events' });

EventSchema.index({ class_id: 1, start_time: 1 });
EventSchema.index({ teacher_id: 1, status: 1 });
EventSchema.index({ status: 1, start_time: 1 });
EventSchema.index({ class_id: 1, start_time: 1, end_time: 1 }, { name: 'class_time_overlap_prevention', partialFilterExpression: { status: { $ne: 'canceled' } } });

export const EventModel = mongoose.model<IEventDocument>('Event', EventSchema);

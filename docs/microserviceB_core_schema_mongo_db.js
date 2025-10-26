// MongoDB Schemas for Microservice B - Core (Mongoose models)

// events.js
const mongoose = require('mongoose');
const EventSchema = new mongoose.Schema({
  class_id: { type: Number, required: true },
  teacher_id: { type: Number, required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  location: {
    latitude: Number,
    longitude: Number
  },
  qr_token: { type: String, required: true },
  status: { type: String, enum: ['active', 'closed', 'canceled'], default: 'active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Event', EventSchema);

// attendances.js
const AttendanceSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  student_id: { type: Number, required: true },
  status: { type: String, enum: ['recorded', 'manual', 'retroactive', 'invalid'], required: true },
  timestamp: { type: Date, default: Date.now },
  location: {
    latitude: Number,
    longitude: Number
  },
  validation: {
    within_radius: Boolean,
    distance_meters: Number
  },
  created_by: { type: String, default: 'system' },
  created_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Attendance', AttendanceSchema);

// occurrences.js
const OccurrenceSchema = new mongoose.Schema({
  type: { type: String, enum: ['student_not_in_class', 'manual_note', 'invalid_qr'], required: true },
  teacher_id: { type: Number, required: true },
  student_cpf: { type: String, required: true },
  class_id: { type: Number, required: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
  notified_to_institution: { type: Boolean, default: false }
});
module.exports = mongoose.model('Occurrence', OccurrenceSchema);

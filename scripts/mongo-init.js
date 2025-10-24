// MongoDB initialization script
// This script creates the initial database structure and indexes

db = db.getSiblingDB('aki_core');

// Create collections
db.createCollection('events');
db.createCollection('attendances');
db.createCollection('occurrences');

// Create indexes for events collection
db.events.createIndex({ "class_id": 1, "start_time": 1 });
db.events.createIndex({ "teacher_id": 1, "status": 1 });
db.events.createIndex({ "status": 1, "start_time": 1 });
db.events.createIndex(
    { "class_id": 1, "start_time": 1, "end_time": 1 },
    { 
        name: "class_time_overlap_prevention",
        partialFilterExpression: { "status": { $ne: "canceled" } }
    }
);

// Create indexes for attendances collection
db.attendances.createIndex({ "event_id": 1, "student_id": 1 }, { unique: true });
db.attendances.createIndex({ "event_id": 1, "timestamp": -1 });
db.attendances.createIndex({ "student_id": 1, "timestamp": -1 });
db.attendances.createIndex({ "status": 1, "created_at": -1 });

// Create indexes for occurrences collection
db.occurrences.createIndex({ "class_id": 1, "created_at": -1 });
db.occurrences.createIndex({ "teacher_id": 1, "created_at": -1 });
db.occurrences.createIndex({ "type": 1, "created_at": -1 });
db.occurrences.createIndex({ "notified_to_institution": 1, "created_at": -1 });

print('Database initialized successfully with collections and indexes');

// Insert sample data for development
if (db.getName() === 'aki_core') {
    // Sample event
    db.events.insertOne({
        class_id: 1,
        teacher_id: 1,
        start_time: new Date('2024-01-15T10:00:00Z'),
        end_time: new Date('2024-01-15T12:00:00Z'),
        location: {
            latitude: -23.5505,
            longitude: -46.6333
        },
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
    });

    print('Sample data inserted for development');
}
export interface CreateEventCommand {
  class_id: number;
  teacher_id: number;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  location: {
    latitude: number;
    longitude: number;
  };
}

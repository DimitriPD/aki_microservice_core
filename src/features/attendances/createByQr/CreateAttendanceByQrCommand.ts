export interface CreateAttendanceByQrCommand {
  qr_token: string;
  device_id: string;
  student_cpf: string;
  location?: { latitude: number; longitude: number };
  device_time?: string; // ISO
}

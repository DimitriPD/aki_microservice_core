import { Router } from 'express';
import { AttendanceController } from '../controllers/AttendanceController';
import { authMiddleware } from '../middlewares/AuthMiddleware';
import { validateAttendanceByQr } from '../middlewares/ValidationMiddleware';

export function createAttendanceRoutes(attendanceController: AttendanceController): Router {
  const router = Router();

  // Apply auth middleware to all routes
  router.use(authMiddleware);

  // GET /attendances - List attendances with pagination and filters
  router.get('/', (req, res, next) => attendanceController.listAttendances(req, res, next));

  // POST /attendances - Create attendance by QR token
  router.post('/', validateAttendanceByQr, (req, res, next) => 
    attendanceController.createAttendanceByQr(req, res, next)
  );

  // GET /attendances/:attendanceId - Get specific attendance
  router.get('/:attendanceId', (req, res, next) => 
    attendanceController.getAttendance(req, res, next)
  );

  // PUT /attendances/:attendanceId - Update attendance
  router.put('/:attendanceId', (req, res, next) => 
    attendanceController.updateAttendance(req, res, next)
  );

  return router;
}
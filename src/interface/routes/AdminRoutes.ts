import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware } from '../middlewares/AuthMiddleware';

export function createAdminRoutes(adminController: AdminController): Router {
  const router = Router();

  // Apply auth middleware to all routes
  router.use(authMiddleware);

  // POST /admin/export/attendances - Export attendances
  router.post('/export/attendances', (req, res, next) => 
    adminController.exportAttendances(req, res, next)
  );

  return router;
}
import { Router } from 'express';
import { registerCreateAttendanceByQrEndpoint } from './createByQr/CreateAttendanceByQrEndpoint';
import { registerListAttendancesEndpoint } from './list/ListAttendancesEndpoint';
import { registerGetAttendanceEndpoint } from './get/GetAttendanceEndpoint';
import { registerUpdateAttendanceEndpoint } from './update/UpdateAttendanceEndpoint';

export function buildAttendancesRouter(): Router {
  const router = Router();
  registerListAttendancesEndpoint(router);
  registerCreateAttendanceByQrEndpoint(router);
  registerGetAttendanceEndpoint(router);
  registerUpdateAttendanceEndpoint(router);
  return router;
}

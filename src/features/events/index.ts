import { Router } from 'express';
import { registerListEventsEndpoint } from './list/ListEventsEndpoint';
import { registerCreateEventEndpoint } from './create/CreateEventEndpoint';
import { registerGetEventEndpoint } from './get/GetEventEndpoint';
import { registerGetEventQrEndpoint } from './get/GetEventQrEndpoint';
import { registerGetEventByQrEndpoint } from './getByQr/GetEventByQrEndpoint';
import { registerUpdateEventEndpoint } from './update/UpdateEventEndpoint';
import { registerDeleteEventEndpoint } from './delete/DeleteEventEndpoint';

export function buildEventsRouter(): Router {
  const router = Router();
  // Order matters for overlapping paths
  registerListEventsEndpoint(router);
  registerGetEventByQrEndpoint(router);
  registerCreateEventEndpoint(router);
  registerGetEventEndpoint(router);
  registerGetEventQrEndpoint(router);
  registerUpdateEventEndpoint(router);
  registerDeleteEventEndpoint(router);
  return router;
}

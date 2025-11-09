import { EventRepositoryImpl } from '../events/persistence/EventRepositoryImpl';
import { AttendanceRepositoryImpl } from '../attendances/persistence/AttendanceRepositoryImpl';
import { OccurrenceRepositoryImpl } from '../occurrences/persistence/OccurrenceRepositoryImpl';
import { PersonasServiceImpl } from '../../infrastructure/services/PersonasService';
import { TokenService } from '../../shared/utils/TokenService';
import { config } from '../../infrastructure/config/Config';

export interface Dependencies {
  eventRepository: EventRepositoryImpl;
  attendanceRepository: AttendanceRepositoryImpl;
  occurrenceRepository: OccurrenceRepositoryImpl;
  personasService: PersonasServiceImpl;
  tokenService: TokenService;
}

let deps: Dependencies | null = null;

export function getDependencies(): Dependencies {
  if (!deps) {
    deps = {
      eventRepository: new EventRepositoryImpl(),
      attendanceRepository: new AttendanceRepositoryImpl(),
      occurrenceRepository: new OccurrenceRepositoryImpl(),
      personasService: new PersonasServiceImpl(config.personasBaseUrl),
      tokenService: new TokenService(config.jwtSecret)
    };
  }
  return deps;
}

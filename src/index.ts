import express from 'express';
// Early diagnostic logging BEFORE other imports finish (raw console for container visibility)
// eslint-disable-next-line no-console
console.log('[startup] Beginning application bootstrap');
// eslint-disable-next-line no-console
console.log('[startup] Node version:', process.version);
// eslint-disable-next-line no-console
console.log('[startup] Working directory:', process.cwd());
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import path from 'path';
import fs from 'fs';
import { config, validateConfig } from './infrastructure/config/Config';
import { databaseConnection } from './infrastructure/database/connections/MongoConnection';
import { logger } from './shared/logger/Logger';
import { errorHandler, notFoundHandler } from './interface/middlewares/ErrorMiddleware';

// Repositories
import { EventRepositoryImpl } from './infrastructure/repositories/EventRepositoryImpl';
import { AttendanceRepositoryImpl } from './infrastructure/repositories/AttendanceRepositoryImpl';
import { OccurrenceRepositoryImpl } from './infrastructure/repositories/OccurrenceRepositoryImpl';

// Services
import { PersonasServiceImpl } from './application/services/PersonasService';
import { TokenService } from './shared/utils/TokenService';

// Use Cases
import { CreateEventUseCase } from './application/use-cases/events/CreateEventUseCase';
import { GetEventUseCase } from './application/use-cases/events/GetEventUseCase';
import { ListEventsUseCase } from './application/use-cases/events/ListEventsUseCase';
import { UpdateEventUseCase } from './application/use-cases/events/UpdateEventUseCase';
import { DeleteEventUseCase } from './application/use-cases/events/DeleteEventUseCase';
import { CreateAttendanceByQrUseCase } from './application/use-cases/attendances/CreateAttendanceByQrUseCase';

// Controllers
import { EventController } from './interface/controllers/EventController';
import { AttendanceController } from './interface/controllers/AttendanceController';
import { OccurrenceController } from './interface/controllers/OccurrenceController';

// Routes
import { createEventRoutes } from './interface/routes/EventRoutes';
import { createAttendanceRoutes } from './interface/routes/AttendanceRoutes';
import { createOccurrenceRoutes } from './interface/routes/OccurrenceRoutes';

class Application {
  private app: express.Application;
  private eventRepository!: EventRepositoryImpl;
  private attendanceRepository!: AttendanceRepositoryImpl;
  private occurrenceRepository!: OccurrenceRepositoryImpl;
  private personasService!: PersonasServiceImpl;
  private tokenService!: TokenService;
  
  // Use Cases
  private createEventUseCase!: CreateEventUseCase;
  private getEventUseCase!: GetEventUseCase;
  private listEventsUseCase!: ListEventsUseCase;
  private updateEventUseCase!: UpdateEventUseCase;
  private deleteEventUseCase!: DeleteEventUseCase;
  private createAttendanceByQrUseCase!: CreateAttendanceByQrUseCase;
  
  // Controllers
  private eventController!: EventController;
  private attendanceController!: AttendanceController;
  private occurrenceController!: OccurrenceController;

  constructor() {
    this.app = express();
    this.setupDependencies();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupDependencies(): void {
    // Initialize repositories
  this.eventRepository = new EventRepositoryImpl();
  this.attendanceRepository = new AttendanceRepositoryImpl();
  this.occurrenceRepository = new OccurrenceRepositoryImpl();
    
    // Initialize services
    this.personasService = new PersonasServiceImpl(config.personasBaseUrl);
    this.tokenService = new TokenService(config.jwtSecret);
    
    // Initialize use cases
    this.createEventUseCase = new CreateEventUseCase(
      this.eventRepository,
      this.tokenService,
      this.personasService
    );
    this.getEventUseCase = new GetEventUseCase(this.eventRepository);
    this.listEventsUseCase = new ListEventsUseCase(this.eventRepository);
    this.updateEventUseCase = new UpdateEventUseCase(this.eventRepository);
    this.deleteEventUseCase = new DeleteEventUseCase(this.eventRepository);
    this.createAttendanceByQrUseCase = new CreateAttendanceByQrUseCase(
      this.attendanceRepository,
      this.eventRepository,
      this.tokenService,
      this.personasService
    );
    
    // Initialize controllers
    this.eventController = new EventController(
      this.createEventUseCase,
      this.getEventUseCase,
      this.listEventsUseCase,
      this.updateEventUseCase,
      this.deleteEventUseCase
    );
    this.attendanceController = new AttendanceController(
      this.createAttendanceByQrUseCase,
      this.attendanceRepository
    );
    this.occurrenceController = new OccurrenceController(
      this.occurrenceRepository,
      this.personasService
    );
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true
    }));

    // Performance middleware
    this.app.use(compression());

    // Parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Root route - API information
    this.app.get('/', (req, res) => {
      res.json({
        name: 'AKI! Microservice B - Core',
        version: '1.0.0',
        description: 'Events, Attendances and Occurrences Management',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          events: '/v1/events',
          attendances: '/v1/attendances',
          occurrences: '/v1/occurrences'
        },
        documentation: {
          swagger: '/docs',
          readme: 'https://github.com/your-org/aki-microservice-core#readme'
        }
      });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: databaseConnection.isHealthy() ? 'connected' : 'disconnected'
      });
    });

    // Swagger Documentation (conditional: only if openapi.yaml exists)
    const openApiPath = path.join(process.cwd(), 'openapi.yaml');
    const openApiPathDocs = path.join(process.cwd(), 'docs', 'openapi.yaml');
    
    // Try both locations: root and docs/
    const finalOpenApiPath = fs.existsSync(openApiPath) ? openApiPath : 
                             fs.existsSync(openApiPathDocs) ? openApiPathDocs : null;
    
    if (finalOpenApiPath) {
      try {
        const openApiDocument = yaml.load(finalOpenApiPath);
        if (openApiDocument.servers) {
          // Update production server to include /v1 prefix if not already present
          openApiDocument.servers = openApiDocument.servers.map((server: any) => {
            if (server.url && server.url.includes('azurewebsites.net') && !server.url.endsWith('/v1')) {
              return {
                ...server,
                url: `${server.url}/v1`,
                description: server.description || 'Production server'
              };
            }
            return server;
          });
        }
        this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
          explorer: true,
          customCss: '.swagger-ui .topbar { display: none }',
          customSiteTitle: 'AKI! Core API Documentation'
        }));
        logger.info('Swagger documentation available at /docs');
      } catch (error) {
        logger.warn('OpenAPI file found but failed to parse; continuing without /docs', { error });
      }
    } else {
      logger.warn('openapi.yaml not found in root or docs/; Swagger UI disabled');
    }

    // API routes
    this.app.use('/v1/events', createEventRoutes(this.eventController));
    this.app.use('/v1/attendances', createAttendanceRoutes(this.attendanceController));
    this.app.use('/v1/occurrences', createOccurrenceRoutes(this.occurrenceController));
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Validate configuration
      validateConfig();
      
      const skipDb = process.env.SKIP_DB === 'true' || process.env.ALLOW_START_WITHOUT_DB === 'true';
      if (skipDb) {
        logger.warn('Database connection skipped due to SKIP_DB/ALLOW_START_WITHOUT_DB flag');
      } else {
        await databaseConnection.connect(config.mongoUri);
      }
      
      // Start server
      this.app.listen(config.port, () => {
        logger.info(`Server started on port ${config.port}`, {
          port: config.port,
          env: config.nodeEnv
        });
        // eslint-disable-next-line no-console
        console.log(`[startup] Server listening on port ${config.port}`);
        if (skipDb) {
          // eslint-disable-next-line no-console
          console.log('[startup] WARNING: running without database connection');
        }
      });
    } catch (error) {
      logger.error('Failed to start application', error);
      // eslint-disable-next-line no-console
      console.error('[startup] Fatal error during bootstrap:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      await databaseConnection.disconnect();
      logger.info('Application stopped gracefully');
    } catch (error) {
      logger.error('Error during shutdown', error);
    }
  }
}

// Create and start application
const app = new Application();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await app.stop();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await app.stop();
});

// Start the application
app.start().catch((error) => {
  logger.error('Failed to start application', error);
  process.exit(1);
});

export default app;
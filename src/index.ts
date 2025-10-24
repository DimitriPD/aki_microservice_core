import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import path from 'path';
import { config, validateConfig } from './infrastructure/config/Config';
import { databaseConnection } from './infrastructure/database/connections/MongoConnection';
import { logger } from './shared/logger/Logger';
import { errorHandler, notFoundHandler } from './interface/middlewares/ErrorMiddleware';

// Repositories
import { EventRepositoryImpl } from './infrastructure/repositories/EventRepositoryImpl';
import { AttendanceRepositoryImpl } from './infrastructure/repositories/AttendanceRepositoryImpl';

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
import { AdminController } from './interface/controllers/AdminController';

// Routes
import { createEventRoutes } from './interface/routes/EventRoutes';
import { createAttendanceRoutes } from './interface/routes/AttendanceRoutes';
import { createOccurrenceRoutes } from './interface/routes/OccurrenceRoutes';
import { createAdminRoutes } from './interface/routes/AdminRoutes';

class Application {
  private app: express.Application;
  private eventRepository!: EventRepositoryImpl;
  private attendanceRepository!: AttendanceRepositoryImpl;
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
  private adminController!: AdminController;

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
    
    // Initialize services
    this.personasService = new PersonasServiceImpl(config.personasBaseUrl);
    this.tokenService = new TokenService(config.jwtSecret);
    
    // Initialize use cases
    this.createEventUseCase = new CreateEventUseCase(
      this.eventRepository,
      this.tokenService
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
      this.createAttendanceByQrUseCase
    );
    this.occurrenceController = new OccurrenceController();
    this.adminController = new AdminController();
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
          occurrences: '/v1/occurrences',
          admin: '/v1/admin'
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

    // Swagger Documentation
    try {
      const openApiDocument = yaml.load(path.join(process.cwd(), 'openapi.yaml'));
      
      // Update servers to include localhost for development
      if (openApiDocument.servers) {
        openApiDocument.servers.unshift({
          url: `http://localhost:${config.port}/v1`,
          description: 'Local development server'
        });
      }
      
      this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'AKI! Core API Documentation'
      }));
      
      logger.info('Swagger documentation available at /docs');
    } catch (error) {
      logger.error('Failed to load OpenAPI documentation', error);
    }

    // API routes
    this.app.use('/v1/events', createEventRoutes(this.eventController));
    this.app.use('/v1/attendances', createAttendanceRoutes(this.attendanceController));
    this.app.use('/v1/occurrences', createOccurrenceRoutes(this.occurrenceController));
    this.app.use('/v1/admin', createAdminRoutes(this.adminController));
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
      
      // Connect to database
      await databaseConnection.connect(config.mongoUri);
      
      // Start server
      this.app.listen(config.port, () => {
        logger.info(`Server started on port ${config.port}`, {
          port: config.port,
          env: config.nodeEnv
        });
      });
    } catch (error) {
      logger.error('Failed to start application', error);
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
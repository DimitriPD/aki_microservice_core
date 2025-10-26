import dotenv from 'dotenv';
import { logger } from '../../shared/logger/Logger';

// Load environment variables
dotenv.config();

export interface Config {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  personasBaseUrl: string;
  functionNotificationsUrl: string;
  nodeEnv: string;
  logLevel: string;
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/aki_core',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  personasBaseUrl: process.env.PERSONAS_BASE_URL || 'http://localhost:3000',
  functionNotificationsUrl: process.env.FUNCTION_NOTIFICATIONS_URL || 'http://localhost:7071',
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info'
};

export function validateConfig(): void {
  const skipDb = process.env.SKIP_DB === 'true' || process.env.ALLOW_START_WITHOUT_DB === 'true';

  // Debug: log all env vars starting with relevant prefixes (sanitized)
  // eslint-disable-next-line no-console
  console.log('[config] Environment check:');
  // eslint-disable-next-line no-console
  console.log('[config] NODE_ENV:', process.env.NODE_ENV);
  // eslint-disable-next-line no-console
  console.log('[config] PORT:', process.env.PORT);
  // eslint-disable-next-line no-console
  console.log('[config] MONGO_URI present:', !!process.env.MONGO_URI);
  // eslint-disable-next-line no-console
  console.log('[config] JWT_SECRET present:', !!process.env.JWT_SECRET);
  // eslint-disable-next-line no-console
  console.log('[config] SKIP_DB:', skipDb);

  const requiredVars = [
    'MONGO_URI',
    'JWT_SECRET'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  // If we're in a diagnostic mode (skip DB), relax requirements
  if (missing.length > 0) {
    if (skipDb) {
      logger.warn(`Missing env vars (diagnostic mode): ${missing.join(', ')} - proceeding due to SKIP_DB/ALLOW_START_WITHOUT_DB flag`);
      // Provide a fallback JWT_SECRET if absent to avoid runtime crashes
      if (!process.env.JWT_SECRET) {
        process.env.JWT_SECRET = 'diagnostic-fallback-secret-key-change-me';
      }
      return;
    }
    if (config.nodeEnv === 'production') {
      // eslint-disable-next-line no-console
      console.error('[config] FATAL: Missing required vars in production:', missing.join(', '));
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    } else {
      logger.warn(`Missing non-critical env vars in ${config.nodeEnv}: ${missing.join(', ')}`);
      if (!process.env.JWT_SECRET) {
        process.env.JWT_SECRET = 'dev-fallback-secret-key-change-me';
      }
    }
  }
}
import dotenv from 'dotenv';

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
  const requiredVars = [
    'MONGO_URI',
    'JWT_SECRET'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0 && config.nodeEnv === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
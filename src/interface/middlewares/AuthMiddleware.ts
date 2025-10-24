import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../../shared/utils/TokenService';
import { UnauthorizedError } from '../../shared/errors/AppErrors';
import { logger } from '../../shared/logger/Logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export function createAuthMiddleware(tokenService: TokenService) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid authorization header');
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        const decoded = tokenService.verifyAuthToken(token);
        req.user = {
          userId: decoded.userId,
          role: decoded.role
        };

        logger.debug('User authenticated', { userId: decoded.userId, role: decoded.role });
        next();
      } catch (error) {
        logger.warn('Invalid auth token', { error: (error as Error).message });
        throw new UnauthorizedError('Invalid or expired token');
      }
    } catch (error) {
      next(error);
    }
  };
}

// Mock auth middleware for development
export function mockAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Mock user for development/testing
  req.user = {
    userId: '1',
    role: 'teacher'
  };
  
  next();
}

// Export the middleware function to be used in routes
export const authMiddleware = process.env.NODE_ENV === 'development' 
  ? mockAuthMiddleware 
  : createAuthMiddleware(new TokenService(process.env.JWT_SECRET || 'fallback-secret'));
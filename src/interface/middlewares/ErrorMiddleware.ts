import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../../shared/errors/AppErrors';
import { logger } from '../../shared/logger/Logger';

export function errorHandler(
  error: Error | BaseError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  if (error instanceof BaseError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details || []
      }
    });
    return;
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid data provided',
        details: [error.message]
      }
    });
    return;
  }

  // Handle Mongoose cast errors
  if (error.name === 'CastError') {
    res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: 'Invalid ID format',
        details: ['The provided ID is not a valid ObjectId']
      }
    });
    return;
  }

  // Handle MongoDB duplicate key errors
  if ((error as any).code === 11000) {
    res.status(409).json({
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Resource already exists',
        details: ['A resource with these unique fields already exists']
      }
    });
    return;
  }

  // Default internal server error
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      details: []
    }
  });
}

// 404 handler for unmatched routes
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      details: []
    }
  });
}
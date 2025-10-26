import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../../shared/errors/AppErrors';
import { logger } from '../../shared/logger/Logger';

// Helper function to extract enum values from error message
function extractEnumFromMessage(message: string): string[] {
  const match = message.match(/`([^`]+)` is not a valid enum value for path `([^`]+)`/);
  if (match) {
    // Try to extract from common patterns in Mongoose error messages
    const pathMatch = message.match(/enum: \[(.*?)\]/);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1].split(',').map((v) => v.trim().replace(/['"]/g, ''));
    }
  }
  return [];
}

// Map of known enum fields with their allowed values
const KNOWN_ENUMS: Record<string, string[]> = {
  status: ['recorded', 'manual', 'retroactive', 'invalid'],
  event_status: ['active', 'closed', 'canceled'],
  occurrence_type: ['student_not_in_class', 'manual_note', 'invalid_qr', 'duplicate_scan'],
  type: ['student_not_in_class', 'manual_note', 'invalid_qr', 'duplicate_scan']
};

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
    const mongooseError = error as any;
    const details: string[] = [];

    // Extract individual field errors
    if (mongooseError.errors) {
      Object.keys(mongooseError.errors).forEach((field) => {
        const fieldError = mongooseError.errors[field];

        if (fieldError.kind === 'enum') {
          // Try multiple strategies to get enum values
          let enumValues: string[] = [];
          
          // Strategy 1: Check our known enums map
          if (KNOWN_ENUMS[field]) {
            enumValues = KNOWN_ENUMS[field];
          }
          
          // Strategy 2: Try to extract from Mongoose error object
          if (!enumValues.length) {
            enumValues = 
              fieldError.enumValues ||
              fieldError.properties?.enumValues ||
              [];
          }
          
          // Strategy 3: Try to extract from error message
          if (!enumValues.length) {
            enumValues = extractEnumFromMessage(fieldError.message || '');
          }

          const enumList = enumValues && enumValues.length > 0 ? enumValues.join(', ') : 'check schema';
          details.push(
            `Field '${field}': Value '${fieldError.value}' is not valid. Allowed values: ${enumList}`
          );
        } else if (fieldError.kind === 'required') {
          details.push(`Field '${field}' is required`);
        } else if (fieldError.kind === 'min' || fieldError.kind === 'max') {
          details.push(`Field '${field}': ${fieldError.message}`);
        } else {
          details.push(`Field '${field}': ${fieldError.message}`);
        }
      });
    }

    // If no specific errors found, use the general message
    if (details.length === 0) {
      details.push(error.message);
    }

    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid data provided',
        details
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
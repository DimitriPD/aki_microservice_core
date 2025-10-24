export interface AppError {
  message: string;
  statusCode: number;
  code: string;
  details?: string[];
}

export class BaseError extends Error implements AppError {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: string[];

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, details?: string[]) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends BaseError {
  constructor(message: string, details?: string[]) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class BusinessRuleError extends BaseError {
  constructor(message: string, details?: string[]) {
    super(message, 422, 'BUSINESS_RULE_VIOLATION', details);
  }
}

export class ExternalServiceError extends BaseError {
  constructor(message: string, service: string) {
    super(message, 503, 'EXTERNAL_SERVICE_ERROR', [`Service: ${service}`]);
  }
}
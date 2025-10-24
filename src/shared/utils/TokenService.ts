import jwt from 'jsonwebtoken';

export interface QRTokenPayload {
  eventId: string;
  classId: number;  
  teacherId: number;
  exp: number;
  iat: number;
}

export class TokenService {
  private readonly secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  /**
   * Generate a QR token for an event
   */
  generateQRToken(eventId: string, classId: number, teacherId: number, expiresAt: Date): string {
    const payload: Omit<QRTokenPayload, 'iat' | 'exp'> = {
      eventId,
      classId,
      teacherId
    };

    const expiresInSeconds = Math.floor(expiresAt.getTime() / 1000) - Math.floor(Date.now() / 1000);

    return jwt.sign(payload as any, this.secret, {
      expiresIn: expiresInSeconds + 's',
      algorithm: 'HS256'
    } as any);
  }

  /**
   * Verify and decode a QR token
   */
  verifyQRToken(token: string): QRTokenPayload {
    try {
      return jwt.verify(token, this.secret, {
        algorithms: ['HS256']
      }) as QRTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('QR token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid QR token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Check if a token is expired without throwing
   */
  isTokenExpired(token: string): boolean {
    try {
      jwt.verify(token, this.secret);
      return false;
    } catch (error) {
      return error instanceof jwt.TokenExpiredError;
    }
  }

  /**
   * Generate JWT token for API authentication
   */
  generateAuthToken(userId: string, role: string, expiresIn: string = '24h'): string {
    const payload = {
      userId,
      role,
      type: 'auth'
    };

    return jwt.sign(payload as any, this.secret, {
      expiresIn,
      algorithm: 'HS256'
    } as any);
  }

  /**
   * Verify auth token
   */
  verifyAuthToken(token: string): { userId: string; role: string; type: string } {
    try {
      return jwt.verify(token, this.secret, {
        algorithms: ['HS256']
      }) as { userId: string; role: string; type: string };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Auth token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid auth token');
      }
      throw new Error('Auth token verification failed');
    }
  }
}
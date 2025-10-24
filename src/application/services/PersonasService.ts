import axios from 'axios';
import { ExternalServiceError } from '../../shared/errors/AppErrors';
import { logger } from '../../shared/logger/Logger';

export interface Student {
  id: number;
  cpf: string;
  name: string;
  email?: string;
}

export interface PersonasService {
  getStudentByCpf(cpf: string): Promise<Student | null>;
  isStudentInClass(studentId: number, classId: number): Promise<boolean>;
}

export class PersonasServiceImpl implements PersonasService {
  private readonly baseUrl: string;
  private readonly timeout: number = 5000;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getStudentByCpf(cpf: string): Promise<Student | null> {
    try {
      logger.info('Fetching student by CPF', { cpf });

      // In development/testing, we can mock this
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetStudentByCpf(cpf);
      }

      const response = await axios.get(`${this.baseUrl}/students/cpf/${cpf}`, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }

      logger.error('Error fetching student by CPF', { cpf, error: error.message });
      throw new ExternalServiceError(
        'Failed to fetch student information',
        'PersonasService'
      );
    }
  }

  async isStudentInClass(studentId: number, classId: number): Promise<boolean> {
    try {
      logger.info('Checking if student is in class', { studentId, classId });

      // In development/testing, we can mock this
      if (process.env.NODE_ENV === 'development') {
        return this.mockIsStudentInClass(studentId, classId);
      }

      const response = await axios.get(
        `${this.baseUrl}/classes/${classId}/students/${studentId}/membership`,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data?.isMember || false;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }

      logger.error('Error checking student class membership', { 
        studentId, 
        classId, 
        error: error.message 
      });

      throw new ExternalServiceError(
        'Failed to verify student class membership',
        'PersonasService'
      );
    }
  }

  // Mock implementations for development/testing
  private mockGetStudentByCpf(cpf: string): Student | null {
    // Mock some test students
    const mockStudents: Student[] = [
      { id: 1, cpf: '12345678901', name: 'João Silva', email: 'joao@test.com' },
      { id: 2, cpf: '98765432100', name: 'Maria Santos', email: 'maria@test.com' },
      { id: 3, cpf: '11122233344', name: 'Pedro Costa', email: 'pedro@test.com' }
    ];

    return mockStudents.find(student => student.cpf === cpf) || null;
  }

  private mockIsStudentInClass(studentId: number, classId: number): boolean {
    // Mock logic: assume students 1-3 are in classes 1-2
    const validCombinations = [
      { studentId: 1, classId: 1 },
      { studentId: 1, classId: 2 },
      { studentId: 2, classId: 1 },
      { studentId: 3, classId: 2 }
    ];

    return validCombinations.some(
      combo => combo.studentId === studentId && combo.classId === classId
    );
  }
}
import axios from 'axios';
import { ExternalServiceError } from '../../shared/errors/AppErrors';
import { logger } from '../../shared/logger/Logger';

export interface Student {
  id: number;
  cpf: string;
  full_name: string;
  device_id?: string | null;
}

export interface Teacher {
  id: number;
  cpf: string;
  full_name: string;
  email: string;
}

export interface ClassSummary {
  id: number;
  name: string;
}

export interface PersonasService {
  getStudentByCpf(cpf: string): Promise<Student | null>;
  getTeacherById(teacherId: number): Promise<Teacher | null>;
  getClassById(classId: number): Promise<ClassSummary | null>;
  isStudentInClass(studentId: number, classId: number): Promise<boolean>;
  isTeacherInClass(teacherId: number, classId: number): Promise<boolean>;
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

      const response = await axios.get(`${this.baseUrl}/students`, {
        params: { q: cpf },
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const students = response.data.data || [];
      // Find exact CPF match since 'q' does partial search
      const student = students.find((s: Student) => s.cpf === cpf);
      return student || null;
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

      const response = await axios.get(`${this.baseUrl}/classes/${classId}/students`, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const students = response.data.data || [];
      return students.some((s: Student) => s.id === studentId);
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

  async getTeacherById(teacherId: number): Promise<Teacher | null> {
    try {
      logger.info('Fetching teacher by id', { teacherId });
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetTeacherById(teacherId);
      }
      const response = await axios.get(`${this.baseUrl}/teachers/${teacherId}`, {
        timeout: this.timeout,
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      logger.error('Error fetching teacher by id', { teacherId, error: error.message });
      throw new ExternalServiceError('Failed to fetch teacher information', 'PersonasService');
    }
  }

  async getClassById(classId: number): Promise<ClassSummary | null> {
    try {
      logger.info('Fetching class by id', { classId });
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetClassById(classId);
      }
      const response = await axios.get(`${this.baseUrl}/classes/${classId}`, {
        timeout: this.timeout,
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      logger.error('Error fetching class by id', { classId, error: error.message });
      throw new ExternalServiceError('Failed to fetch class information', 'PersonasService');
    }
  }

  async isTeacherInClass(teacherId: number, classId: number): Promise<boolean> {
    try {
      logger.info('Checking if teacher is in class', { teacherId, classId });
      if (process.env.NODE_ENV === 'development') {
        return this.mockIsTeacherInClass(teacherId, classId);
      }
      const response = await axios.get(
        `${this.baseUrl}/classes/${classId}/teachers`,
        {
          timeout: this.timeout,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      const items: Teacher[] = response.data.data?.items || response.data.data || [];
      return items.some(t => t.id === teacherId);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      logger.error('Error checking teacher class membership', { teacherId, classId, error: error.message });
      throw new ExternalServiceError('Failed to verify teacher class membership', 'PersonasService');
    }
  }


  // Mock implementations for development/testing
  private mockGetStudentByCpf(cpf: string): Student | null {
    // Mock some test students
    const mockStudents: Student[] = [
      { id: 1, cpf: '12345678901', full_name: 'João Silva', device_id: 'dev-1' },
      { id: 2, cpf: '98765432100', full_name: 'Maria Santos', device_id: 'dev-2' },
      { id: 3, cpf: '11122233344', full_name: 'Pedro Costa', device_id: null }
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

  private mockGetTeacherById(teacherId: number): Teacher | null {
    const mockTeachers: Teacher[] = [
      { id: 10, cpf: '22233344455', full_name: 'Prof. Ana Lima', email: 'ana@test.com' },
      { id: 11, cpf: '33344455566', full_name: 'Prof. Bruno Alves', email: 'bruno@test.com' }
    ];
    return mockTeachers.find(t => t.id === teacherId) || null;
  }

  private mockGetClassById(classId: number): ClassSummary | null {
    const mockClasses: ClassSummary[] = [
      { id: 1, name: 'Turma 1' },
      { id: 2, name: 'Turma 2' }
    ];
    return mockClasses.find(c => c.id === classId) || null;
  }

  private mockIsTeacherInClass(teacherId: number, classId: number): boolean {
    const validCombinations = [
      { teacherId: 10, classId: 1 },
      { teacherId: 10, classId: 2 },
      { teacherId: 11, classId: 2 }
    ];
    return validCombinations.some(v => v.teacherId === teacherId && v.classId === classId);
  }
}
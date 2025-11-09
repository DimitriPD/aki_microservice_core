import type { Config } from 'jest';
// Jest config for TypeScript + architecture tests

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  coverageProvider: 'v8',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/application/(.*)$': '<rootDir>/src/application/$1',
    '^@/domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@/infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@/interface/(.*)$': '<rootDir>/src/interface/$1',
    '^@/shared/(.*)$': '<rootDir>/src/shared/$1'
  },
  verbose: true,
  // Ensure TypeScript source maps for better stack traces
  transform: {
    '^.+\\.(ts)$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  }
};

export default config;
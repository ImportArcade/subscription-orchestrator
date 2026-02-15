module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  // Clear mocks between tests
  clearMocks: true,
  
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Coverage configuration (optional but recommended)
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
}
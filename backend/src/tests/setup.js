// tests/setup.js

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/bookstore_test';

// Global test timeout
jest.setTimeout(10000);

// Suppress console.log in tests (optional)
global.console = {
  ...console,
  log: jest.fn(), // Mute console.log
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn() // Keep error for debugging
};

// Mock Date for consistent testing
const mockDate = new Date('2024-12-24T10:00:00.000Z');
global.Date = class extends Date {
  constructor(...args) {
    if (args.length === 0) {
      super(mockDate);
    } else {
      super(...args);
    }
  }

  static now() {
    return mockDate.getTime();
  }
};
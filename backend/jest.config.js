// jest.config.js
module.exports = {
  // Môi trường test
  testEnvironment: 'node',

  // Đường dẫn tìm kiếm test files
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],

  // Coverage thresholds (yêu cầu tối thiểu)
  // Chỉ áp dụng cho các file đã implement đầy đủ
  coverageThreshold: {
    'src/services/salesService.js': {
      branches: 50,
      functions: 40,
      lines: 60,
      statements: 60
    },
    'src/services/paymentService.js': {
      branches: 40,
      functions: 35,
      lines: 50,
      statements: 50
    }
  },

  // Các file cần collect coverage
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js', // Exclude entry point
    '!src/config/**',
    '!**/node_modules/**',
    '!**/tests/**'
  ],

  // Thư mục output coverage
  coverageDirectory: 'coverage',

  // Báo cáo coverage dạng nào
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],

  // Setup files chạy trước mỗi test
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],

  // Timeout cho mỗi test (ms)
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mock calls và instances giữa các tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Các module paths
  moduleDirectories: ['node_modules', 'src'],

  // Transform files với babel (nếu dùng ES modules)
  // transform: {
  //   '^.+\\.js$': 'babel-jest'
  // }
};
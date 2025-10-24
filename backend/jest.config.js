// ============================================
// jest.config.js
// ============================================
//module export=(property) export =:
export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const roots = [ '<rootDir>/src' ];
export const testMatch = [ '**/__tests__/**/*.test.ts' ];
export const collectCoverageFrom = [
	'src/**/*.ts',
	'!src/**/*.d.ts',
	'!src/**/*.test.ts',
	'!src/__tests__/**',
	'!src/index.ts',
];
export const coverageDirectory = 'coverage';
export const coverageReporters = [ 'text', 'lcov', 'html' ];
export const coverageThreshold = {
	global: {
		branches: 70,
		functions: 70,
		lines: 70,
		statements: 70,
	},
};
export const moduleNameMapper = {
	'^@/(.*)$': '<rootDir>/src/$1',
};
export const setupFilesAfterEnv = [ '<rootDir>/src/test-utils/setup.ts' ];
export const testTimeout = 10000;
export const verbose = true;
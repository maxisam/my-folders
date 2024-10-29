/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    rootDir: './',
    testMatch: ['<rootDir>/src/**/*.test.ts'],
    testEnvironment: 'node',
    transform: {
        '^.+.ts$': ['ts-jest', { tsconfig: '<rootDir>/src/tsconfig.test.json' }],
    },
    verbose: true,
    collectCoverage: true,
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    collectCoverage: true,
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
    maxWorkers: 2,
};
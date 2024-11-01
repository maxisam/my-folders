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
            branches: 10,
            functions: 10,
            lines: 10,
            statements: 10,
        },
    },
    maxWorkers: 2,
};
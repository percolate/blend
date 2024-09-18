const { jest } = require('@percolate/kona')

module.exports = {
    ...jest,
    preset: 'ts-jest',
    collectCoverageFrom: ['pkgs/eslint-plugin/src/**/*.ts', 'pkgs/kona/src/**/*.ts'],
    roots: ['pkgs/eslint-plugin/src', 'pkgs/kona/src'],
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    reporters: ['default', 'jest-junit'],
    testTimeout: 30000,
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/__mocks__/fileMock.js',
        '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
    },
}

const { jest } = require('@percolate/kona')
module.exports = {
    ...jest,
    preset: 'ts-jest',
    collectCoverageFrom: ['pkgs/eslint-plugin/src/**/*.ts', 'pkgs/kona/src/**/*.ts'],
    roots: ['pkgs/eslint-plugin/src', 'pkgs/kona/src'],
    testEnvironment: 'node',
}

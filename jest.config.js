const { jest } = require('@percolate/kona')
module.exports = {
    ...jest,
    preset: 'ts-jest',
    collectCoverageFrom: ['pkgs/eslint-plugin/src/**/*.ts'],
    roots: ['pkgs/eslint-plugin/src'],
    testEnvironment: 'node',
}

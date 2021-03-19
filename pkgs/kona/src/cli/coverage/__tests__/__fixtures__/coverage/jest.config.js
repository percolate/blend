const { jest } = require('@percolate/kona')
module.exports = {
    ...jest,
    preset: 'ts-jest',
    collectCoverageFrom: ['*.ts'],
    testEnvironment: 'node',
}

const { jest } = require('@percolate/kona')
module.exports = {
    ...jest,
    roots: ['pkgs/eslint-plugin/src'],
    testEnvironment: 'node',
}

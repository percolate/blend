module.exports = {
    extends: ['plugin:@percolate/base', 'plugin:@percolate/node'],
    rules: {
        '@percolate/test-suite-name': ['error', { basePaths: [__dirname] }],
    },
}

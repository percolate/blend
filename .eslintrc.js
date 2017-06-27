module.exports = {
    extends: ['eslint:recommended'],
    env: { node: true, es6: true },
    plugins: ['prettier'],
    rules: {
        'no-extra-semi': 'off', // prettier conflict,
        'no-mixed-spaces-and-tabs': 'off', // prettier conflict,

        'prettier/prettier': [
            'error',
            { printWidth: 110, tabWidth: 4, singleQuote: true, trailingComma: 'es5', semi: false },
        ],
    },
}

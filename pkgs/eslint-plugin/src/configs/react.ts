export const react = {
    extends: ['plugin:react/recommended'],
    globals: {
        // env globals
        BUILD: 'readonly',
        DEBUG: 'readonly',
        TEST: 'readonly',
        TEST_DEBUG: 'readonly',

        // define small native env APIs
        // so that common variable names (ex. event, find) are not accidentally used
        // browser env APIs
        window: 'readonly',
        document: 'readonly',
        // web workers env APIs
        self: 'readonly',
    },
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ['react', 'react-hooks'],
    settings: {
        'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
        react: {
            version: 'detect',
        },
    },
    rules: {
        '@percolate/no-async': 'error',
        '@percolate/no-jsx-id-attrs': 'error',

        'no-restricted-properties': [
            'error',
            {
                object: 'window',
                property: 'location',
                message: 'Use a proxy that can be stubbed (ex. app.location)',
            },
        ],

        'import/extensions': [
            'error',
            {
                hbs: 'always',
                js: 'never',
                json: 'always',
                jsx: 'never',
                less: 'always',
                ts: 'never',
                tsx: 'never',
            },
        ],
        'import/no-dynamic-require': 'error',
        'import/no-webpack-loader-syntax': 'error',

        'react/jsx-boolean-value': ['error', 'never'],
        'react/no-deprecated': 'off', // TODO: enable with renaming of UNSAFE_* lifecycle methods
        'react/no-did-mount-set-state': 'error',
        'react/no-did-update-set-state': 'error',
        'react/no-find-dom-node': 'error',
        'react/no-multi-comp': ['error', { ignoreStateless: true }],
        'react/no-redundant-should-component-update': 'error',
        'react/no-unescaped-entities': 'off',
        'react/prefer-es6-class': 'error',
        'react/self-closing-comp': ['error', { html: false }],

        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error', // https://github.com/facebook/react/issues/14920#issuecomment-471070149
    },
    overrides: [
        {
            files: ['*.tsx'],
            rules: {
                'react/prop-types': 'off',
                'react/react-in-jsx-scope': 'off',
            },
        },
        {
            files: ['*.spec.*'],
            rules: {
                '@percolate/no-async': 'off',
                'react/display-name': 'off',
            },
        },
    ],
}

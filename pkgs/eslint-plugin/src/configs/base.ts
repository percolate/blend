// INSTRUCTIONS:
// - use *error*, *warn*, or *off* (no numbers)
// - *off* must only be added when overriding recommended configs
// - *warn* must only be used as a transition to error (if you don't plan on fixing the source, don't add a rule)
// - keep rules in alphabetical order
export const base = {
    env: {
        es6: true,
        node: true,
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:import/errors'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: '2018',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'eslint-comments', 'filenames', 'lodash', '@percolate'],
    settings: {
        'import/cache': { lifetime: Infinity },
    },
    rules: {
        'block-scoped-var': 'error',
        camelcase: ['error', { properties: 'never' }],
        complexity: ['error', { max: 30 }],
        eqeqeq: 'error',
        'guard-for-in': 'error',
        'linebreak-style': ['error', 'unix'],
        'max-nested-callbacks': ['error', 4],
        'max-params': ['error', 4],
        'no-alert': 'error',
        'no-array-constructor': 'error',
        'no-await-in-loop': 'error',
        'no-caller': 'error',
        'no-case-declarations': 'off',
        'no-console': 'off',
        'no-continue': 'error',
        'no-debugger': process.env.CI ? 'error' : 'off',
        'no-div-regex': 'off',
        'no-duplicate-imports': 'error',
        'no-empty-character-class': 'error',
        'no-eq-null': 'error',
        'no-eval': 'error',
        'no-extend-native': 'error',
        'no-extra-bind': 'error',
        'no-extra-semi': 'off', // prettier conflict
        'no-floating-decimal': 'error',
        'no-implied-eval': 'error',
        'no-iterator': 'error',
        'no-label-var': 'error',
        'no-labels': 'error',
        'no-lone-blocks': 'error',
        'no-lonely-if': 'error',
        'no-loop-func': 'error',
        'no-new-require': 'error',
        'no-mixed-spaces-and-tabs': 'off', // prettier conflict
        'no-multi-str': 'error',
        'no-nested-ternary': 'error',
        'no-new': 'error',
        'no-new-func': 'error',
        'no-new-object': 'error',
        'no-new-wrappers': 'error',
        'no-octal-escape': 'error',
        // 'no-process-env': 'error', TODO: move to web
        'no-proto': 'error',
        'no-restricted-imports': 'error',
        'no-return-assign': 'error',
        'no-return-await': 'error',
        'no-self-compare': 'error',
        'no-sequences': 'error',
        'no-shadow': 'error',
        'no-shadow-restricted-names': 'error',
        'no-tabs': 'error',
        'no-throw-literal': 'error',
        'no-unused-expressions': 'error',
        'no-use-before-define': ['error', 'nofunc'],
        'no-useless-call': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-constructor': 'error',
        'no-useless-rename': 'error',
        'no-void': 'error',
        'no-with': 'error',
        'one-var': ['error', 'never'],
        'prefer-numeric-literals': 'error',
        'prefer-promise-reject-errors': 'error',
        'prefer-rest-params': 'error',
        radix: 'error',
        'require-await': 'error',
        'spaced-comment': ['error', 'always'],
        strict: ['error', 'never'],
        'symbol-description': 'error',
        yoda: 'error',

        '@percolate/cjs-default': 'error',
        '@percolate/no-root-arrow-fn': 'error',

        '@typescript-eslint/camelcase': ['error', { properties: 'never' }],
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/interface-name-prefix': ['error', 'always'],
        '@typescript-eslint/member-delimiter-style': [
            'error',
            {
                multiline: {
                    delimiter: 'none',
                    requireLast: false,
                },
                singleline: {
                    delimiter: 'semi',
                    requireLast: false,
                },
            },
        ],
        '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
        '@typescript-eslint/no-var-requires': 'off', // dupe import/no-commonjs
        '@typescript-eslint/prefer-interface': 'off',

        'eslint-comments/no-unused-disable': 'error',
        'eslint-comments/no-unlimited-disable': 'error',

        // Filename must:
        // - start with a letter
        // - not "index"
        // - alphanumeric, `_`, `.<word>`
        'filenames/match-regex': ['error', '^(?!index)[a-zA-Z][a-zA-Z0-9_]+(.[a-z]+)?(.d)?$'],

        'import/no-absolute-path': 'error',
        'import/no-amd': 'error',
        'import/no-anonymous-default-export': 'error',
        'import/no-commonjs': 'error',
        'import/no-mutable-exports': 'error',
        'import/no-named-as-default': 'error',
        'import/no-named-as-default-member': 'error',
        'import/no-unresolved': ['error', { commonjs: true, amd: false }],

        'lodash/callback-binding': 'error',
        'lodash/chaining': ['error', 'never'],
        'lodash/collection-method-value': 'error',
        'lodash/collection-return': 'error',
        'lodash/no-double-unwrap': 'error',
        'lodash/no-extra-args': 'error',
        'lodash/no-unbound-this': 'error',
        'lodash/unwrap': 'error',
    },
    overrides: [
        {
            files: ['*.config.js'],
            rules: {
                'import/no-commonjs': 'off',
            },
        },
        {
            files: ['**/*.ts', '**/*.tsx'],
            rules: {
                '@percolate/no-root-arrow-fn': 'off',
                'import/named': 'off', // currently broken
                'no-undef': 'off',
                'no-use-before-define': 'off',
                camelcase: 'off',

                // handled by TS and types
                '@percolate/react-link': 'off',
                'react/prop-types': 'off',
                'react/react-in-jsx-scope': 'off',
            },
        },
        {
            // all spec files and initial test setup
            files: ['**/*.spec.*', '**/tests/setup.*'],
            env: {
                jest: true,
                mocha: true,
            },
            globals: {
                expect: 'readonly',
            },
            rules: {
                '@percolate/fake-server': 'error',
                '@percolate/no-allow-console': 'error',
                '@percolate/no-async': 'off',
                '@typescript-eslint/no-object-literal-type-assertion': 'warn',
            },
        },
    ],
}

const rule = require('../../../lib/rules/no-async')
const RuleTester = require('eslint').RuleTester

const parser = 'babel-eslint'
const ruleTester = new RuleTester()
ruleTester.run('no-async', rule, {
    valid: [
        {
            code: 'function Foo() { return foo() }',
        },
        {
            code: 'async function Foo() { await foo() }',
            filename: '/foo/bar.spec.js',
            parser,
        },
    ],
    invalid: [
        {
            code: 'async function Foo() { await foo() }',
            parser,
            errors: ['no async function declaration'],
        },
        {
            code: "it('should', async function Foo() { await foo() })",
            parser,
            errors: ['no async function declaration'],
        },
    ],
})

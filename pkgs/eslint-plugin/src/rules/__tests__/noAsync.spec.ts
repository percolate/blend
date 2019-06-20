import { RuleTester } from 'eslint'
import { noAsync } from '../noAsync'

const parser = '@typescript-eslint/parser'
const ruleTester = new RuleTester()
ruleTester.run('no-async', noAsync, {
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

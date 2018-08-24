const rule = require('../../../lib/rules/test-suite-name')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester()

ruleTester.run('test-suite-name', rule, {
    valid: [
        {
            code: 'describe("foo/bar.js")',
            filename: '/foo/bar.js',
        },
        {
            code: 'describe("bar.spec.js")',
            filename: '/foo/bar.spec.js',
            options: [{ basePaths: ['/foo'] }],
        },
        {
            code: 'describe()',
            filename: '/foo/bar.spec.js',
        },
        {
            code: 'describe("foo/bar.spec.js", function() { describe("foo", function() {})})',
            filename: '/foo/bar.spec.js',
        },
        {
            code: 'describe("foo/bar.jsx")',
            filename: '/foo/bar.jsx',
        },
        {
            code: 'app.start = start',
            filename: '/foo/bar.spec.js',
        },
    ],
    invalid: [
        {
            code: 'describe("foo/bar.spec")',
            filename: '/foo/bar.spec.js',
            errors: ['The suit name must match the filename'],
        },
        {
            code: 'describe("Foo", function() {})',
            filename: '/foo/bar.spec.js',
            errors: ['The suit name must match the filename'],
        },
        {
            code: 'describe("/not/foo/bar.spec.js", function() {})',
            filename: '/foo/bar.spec.js',
            errors: ['The suit name must match the filename'],
        },
        {
            code: 'describe("/notfoo/bar.spec", function() {})',
            filename: '/foo/bar.spec.js',
            options: [{ basePaths: ['/foo'] }],
            errors: ['The suit name must match the filename'],
        },
    ],
})

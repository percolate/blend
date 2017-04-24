const rule = require('../../../lib/rules/cjs-default')
const RuleTester = require('eslint').RuleTester
const { resolve } = require('path')

const filename = resolve(__dirname, '../../fixtures/foo.js')
const parserOptions = {
    ecmaVersion: 6,
    sourceType: 'module',
}
const ruleTester = new RuleTester()
ruleTester.run('cjs-default', rule, {
    valid: [
        {
            code: 'var CoolClass = require("./default-class").default',
            filename,
            parserOptions,
        },
        {
            code: 'const { ExportedClass } = require("./named-exports")',
            filename,
            parserOptions,
        },
        {
            code: 'function a() { var CoolClass = require("./default-class").default }',
            filename,
            parserOptions,
        },
    ],
    invalid: [
        {
            code: 'var Foo = require("./es7.js")',
            filename,
            parserOptions,
            errors: ['Parse errors in imported module \'./es7.js\':Unexpected token = (6:16)'],
        },
        {
            code: 'var CoolClass = require("./default-class")',
            filename,
            parserOptions,
            errors: ['requiring ES module must reference default'],
        },
        {
            code: 'function a() { var CoolClass = require("./default-class") }',
            filename,
            parserOptions,
            errors: ['requiring ES module must reference default'],
        },
        {
            code: 'var baz = require("./named-exports").default',
            filename,
            parserOptions,
            errors: ['No default export found in module.'],
        },
    ]
})

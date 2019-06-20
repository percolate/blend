import { cjsDefault } from '../cjsDefault'
import { RuleTester, Linter } from 'eslint'
import { resolve } from 'path'

const filename = resolve(__dirname, './fixtures/foo.js')
const parserOptions: Linter.ParserOptions = {
    sourceType: 'module',
}
const ruleTester = new RuleTester()
ruleTester.run('cjs-default', cjsDefault, {
    valid: [
        {
            code: 'var CoolClass = require("./defaultClass").default',
            filename,
            parserOptions,
        },
        {
            code: 'const { ExportedClass } = require("./namedExports")',
            filename,
            parserOptions,
        },
        {
            code: 'function a() { var CoolClass = require("./defaultClass").default }',
            filename,
            parserOptions,
        },
    ],
    invalid: [
        {
            code: 'var Foo = require("./es7.js")',
            filename,
            parserOptions,
            errors: ["Parse errors in imported module './es7.js':Unexpected token = (undefined:16)"],
        },
        {
            code: 'var CoolClass = require("./defaultClass")',
            filename,
            parserOptions,
            errors: ['requiring ES module must reference default'],
        },
        {
            code: 'function a() { var CoolClass = require("./defaultClass") }',
            filename,
            parserOptions,
            errors: ['requiring ES module must reference default'],
        },
        {
            code: 'var baz = require("./namedExports").default',
            filename,
            parserOptions,
            errors: ['No default export found in module.'],
        },
    ],
})

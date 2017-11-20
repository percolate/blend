const rule = require('../../../lib/rules/no-root-arrow-fn')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester()
const parserOptions = {
    ecmaVersion: 6,
    sourceType: 'module',
}
ruleTester.run('no-root-arrow-fn', rule, {
    valid: [
        {
            code: "function MyComponent() { return 'hello' }",
            parserOptions,
        },
        {
            code: "export function MyComponent() { return 'hello' }",
            parserOptions,
        },
        {
            code: "module.exports = function MyComponent() { return 'hello' }",
            parserOptions,
        },
        {
            code: '[].forEach(() => {})',
            parserOptions,
        },

        // make sure the following don't cause unhandled exceptions
        {
            code: 'let someVar',
            parserOptions,
        },
        {
            code: "export { FOO as BAR } from 'foo/bar'",
            parserOptions,
        },
        {
            code: 'export class UserTasks extends React.PureComponent {}',
            parserOptions,
        },
    ],
    invalid: [
        {
            code: 'const MyComponent = () => {}',
            errors: ['No arrow functions in root'],
            parserOptions,
        },
        {
            code: 'export const MyComponent = () => {}',
            errors: ['No arrow functions in root'],
            parserOptions,
        },
        {
            code: 'exports.MyComponent = () => {}',
            errors: ['No arrow functions in root'],
            parserOptions,
        },
        {
            code: 'module.exports = { MyComponent: () => {}, myComp: function() {} }',
            errors: ['No arrow functions in root'],
            parserOptions,
        },
    ],
})

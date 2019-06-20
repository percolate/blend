import { RuleTester, Linter } from 'eslint'
import { noRootArrowFn } from '../noRootArrowFn'

const ruleTester = new RuleTester()
const parserOptions: Linter.ParserOptions = {
    ecmaVersion: 6,
    sourceType: 'module',
}
ruleTester.run('no-root-arrow-fn', noRootArrowFn, {
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
        {
            code: 'module.exports = { myComp: function() {}, ...supportSpread }',
            parser: '@typescript-eslint/parser',
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

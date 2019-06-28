import { RuleTester, Linter } from 'eslint'
import { noJsxIdAttrs } from '../noJsxIdAttrs'

const parserOptions: Linter.ParserOptions = {
    ecmaFeatures: { jsx: true },
}
const ruleTester = new RuleTester()
ruleTester.run('no-jsx-id-attrs', noJsxIdAttrs, {
    valid: [
        {
            code: 'function Foo() { return <div data-id="foo" /> }',
            parserOptions,
        },
        {
            code: 'function Foo() { return <MyComponent id="foo" /> }',
            parserOptions,
        },
        // custom html tags are not supported
        {
            code: 'function Foo() { return <foo id="foo" /> }',
            parserOptions,
        },
    ],
    invalid: [
        {
            code: 'function Foo() { return <div id="foo" /> }',
            parserOptions,
            errors: ['DOM id attribute is not allowed'],
        },
    ],
})

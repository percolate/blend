const rule = require('../../../lib/rules/no-jsx-id-attrs')
const RuleTester = require('eslint').RuleTester

const parserOptions = {
    ecmaFeatures: { jsx: true },
    parser: 'babel-eslint',
}
const ruleTester = new RuleTester()
ruleTester.run('no-jsx-id-attrs', rule, {
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

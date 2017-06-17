const rule = require('../../../lib/rules/react-link')
const RuleTester = require('eslint').RuleTester

const parserOptions = {
    ecmaFeatures: { jsx: true },
    parser: 'babel-eslint',
    sourceType: 'module',
}
const options = [
    [
        { source: '/link.jsx', skipValidationPropName: 'skip' },
        { source: '/redirect.jsx', routePropNames: ['from', 'to'] },
    ],
]
const ruleTester = new RuleTester()
ruleTester.run('react-link', rule, {
    valid: [
        {
            code: 'import "stuff"',
            options,
            parserOptions,
        },
        {
            code: 'import Link from "/link.jsx"; function Foo() { return <Link path="/path" /> }',
            options,
            parserOptions,
        },
        {
            code:
                'import Link from "/link.jsx"; function Foo() { const url = "example.com"; return <Link path={url} skip /> }',
            options,
            parserOptions,
        },
        {
            code:
                'import Link from "/link.jsx"; function Foo() { var props = { other: "stuff" }; return <Link path="/path" {...props} /> }',
            options,
            parserOptions,
        },
        {
            code:
                'import Redirect from "/redirect.jsx"; function Foo() { var params = {}; return <Redirect from="/foo" to="/bar" params={params} /> }',
            options,
            parserOptions,
        },
        {
            code:
                'import Redirect from "/redirect.jsx"; function Foo() { var bar = "/bar"; return <Redirect from="/foo" to={bar} dangerouslySetExternalUrl /> }',
            options,
            parserOptions,
        },

        // <a href="..." />
        {
            code: 'function Button() { return <a>button</a> }',
            options,
            parserOptions,
        },
        {
            code: 'function Button() { return <a onClick={function () {}}>button</a> }',
            options,
            parserOptions,
        },
        {
            code: 'function Button() { return <a href="javascript:void(0)">button</a> }',
            options,
            parserOptions,
        },
        {
            code: 'function Button() { return <a href="javascript:void(0)" data-id="button">button</a> }',
            options,
            parserOptions,
        },
        {
            code: 'function Button() { return <a href="#">link</a> }',
            options,
            parserOptions,
        },
    ],
    invalid: [
        {
            code: 'import "foo"',
            parserOptions,
            errors: ['At least one option is required (ex. [{ source: "/path/to/link.jsx" }]'],
        },
        {
            code:
                'import Link from "/link.jsx"; function Foo() { var foo = "/path"; return <Link path={foo} /> }',
            options,
            parserOptions,
            errors: ['"path" property must be a string literal'],
        },
        {
            code:
                ' import Redirect from "/redirect.jsx"; function Foo() { var props = { path: "/path" }; return <Redirect {...props} /> }',
            options,
            parserOptions,
            errors: ['missing required prop: "from", "to"'],
        },
        {
            code:
                'import Redirect from "/redirect.jsx"; function Foo() { var bar = "/bar"; return <Redirect from="/foo" to={bar} /> }',
            options,
            parserOptions,
            errors: ['"to" property must be a string literal'],
        },

        // <a href="..." />
        {
            code: 'function Button() { var props = { anything: "bar" }; return <a {...props}>link</a> }',
            parserOptions,
            options,
            errors: [
                'Unable to determine value of href because of spread',
                '<a href="#" /> must be a button otherwise use "/link.jsx", "/redirect.jsx"',
            ],
        },
        {
            code: 'function Button() { var url = "/foo"; return <a href={url}>link</a> }',
            options,
            parserOptions,
            errors: ['<a href="#" /> must be a button otherwise use "/link.jsx", "/redirect.jsx"'],
        },
        {
            code: 'function Button() { return <a href="/foo">link</a> }',
            options,
            parserOptions,
            errors: ['<a href="#" /> must be a button otherwise use "/link.jsx", "/redirect.jsx"'],
        },
        {
            code: 'function Button() { return <a href="mailto:hello@example.com">link</a> }',
            options,
            parserOptions,
            errors: ['<a href="#" /> must be a button otherwise use "/link.jsx", "/redirect.jsx"'],
        },
        {
            code: 'function Button() { return <a href="/foo">link</a> }',
            options,
            parserOptions,
            errors: ['<a href="#" /> must be a button otherwise use "/link.jsx", "/redirect.jsx"'],
        },
    ],
})

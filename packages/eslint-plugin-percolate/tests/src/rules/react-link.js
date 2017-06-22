const rule = require('../../../lib/rules/react-link')
const RuleTester = require('eslint').RuleTester

const parserOptions = {
    ecmaFeatures: { jsx: true },
    parser: 'babel-eslint',
    sourceType: 'module',
}
const options = [
    {
        modules: [
            { import: '/link.jsx', skipValidationPropName: 'skip' },
            {
                import: '/redirect.jsx',
                props: [
                    { routePropName: 'from', paramsPropName: 'from_params' },
                    { routePropName: 'to', paramsPropName: 'to_params' },
                ],
            },
        ],
        routeRegex: '^/.*$',
    },
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
            code: 'import Link from "/link.jsx"; function Foo() { return <Link to="/path" /> }',
            options,
            parserOptions,
        },
        {
            code:
                'import Link from "/link.jsx"; function Foo() { const url = "example.com"; return <Link to={url} skip /> }',
            options,
            parserOptions,
        },
        {
            code:
                'import Link from "/link.jsx"; function Foo() { var props = { other: "stuff" }; return <Link to="/path" {...props} /> }',
            options,
            parserOptions,
        },
        {
            code:
                'import Redirect from "/redirect.jsx"; function Foo() { var bar = 1; return <Redirect from="/foo" to="/foo/:foo/:bar" to_params={{ bar, foo: 1 }} /> }',
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
            errors: ['At least one option is required (ex. { modules: [{ import: "/path/to/link.jsx" }]}'],
        },
        {
            code:
                'import Link from "/link.jsx"; function Foo() { var foo = "/path"; return <Link to={foo} /> }',
            options,
            parserOptions,
            errors: ['"to" property must be a string literal'],
        },
        {
            code:
                'import Redirect from "/redirect.jsx"; function Foo() { var props = { path: "/path" }; return <Redirect {...props} /> }',
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
        {
            code: 'import Link from "/link.jsx"; function Foo() { return <Link to="foo" /> }',
            options,
            parserOptions,
            errors: ['"foo" does not match routeRegex /^/.*$/'],
        },
        {
            code: 'import Redirect from "/redirect.jsx"; function Foo() { return <Redirect to="/:foo" /> }',
            options,
            parserOptions,
            errors: ['"to_params" prop missing'],
        },
        {
            code:
                'import Redirect from "/redirect.jsx"; function Foo() { var params = { foo: 1 } ;return <Redirect to="/:foo" to_params={params} /> }',
            options,
            parserOptions,
            errors: ['"to_params" must be an object with keys declared inline'],
        },
        {
            code:
                'import Redirect from "/redirect.jsx"; function Foo() { return <Redirect from="/:bar" from_params={{ foo: 1 }} to="/:foo/:bar" to_params={{ foo: 1 }} /> }',
            options,
            parserOptions,
            errors: [
                '"from_params" missing "bar" definition',
                '"from" missing "/:foo" in route',
                '"to_params" missing "bar" definition',
            ],
        },

        // <a href="..." />
        {
            code: 'function Button() { var props = { anything: "bar" }; return <a {...props}>link</a> }',
            parserOptions,
            options,
            errors: [
                'Unable to determine value of href because of spread',
                '<a href /> must be a button or use "/link.jsx", "/redirect.jsx"',
            ],
        },
        {
            code: 'function Button() { var url = "/foo"; return <a href={url}>link</a> }',
            options,
            parserOptions,
            errors: ['<a href /> must be a button or use "/link.jsx", "/redirect.jsx"'],
        },
        {
            code: 'function Button() { return <a href="/foo">link</a> }',
            options,
            parserOptions,
            errors: ['<a href /> must be a button or use "/link.jsx", "/redirect.jsx"'],
        },
        {
            code: 'function Button() { return <a href="mailto:hello@example.com">link</a> }',
            options,
            parserOptions,
            errors: ['<a href /> must be a button or use "/link.jsx", "/redirect.jsx"'],
        },
        {
            code: 'function Button() { return <a href="/foo">link</a> }',
            options,
            parserOptions,
            errors: ['<a href /> must be a button or use "/link.jsx", "/redirect.jsx"'],
        },
    ],
})

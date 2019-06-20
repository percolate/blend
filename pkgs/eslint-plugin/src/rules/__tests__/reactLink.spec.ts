import { RuleTester, Linter } from 'eslint'
import { reactLink } from '../reactLink'

const parserOptions: Linter.ParserOptions = {
    ecmaFeatures: { jsx: true },
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
}
const routeRegex = /^\/.*$/
const paramRegex = /^[a-z_]+$/
const options = [
    {
        modules: [
            {
                import: '/link.jsx',
                props: [{ routePropName: 'to', paramsPropName: 'params' }],
            },
            {
                import: '/redirect.jsx',
                props: [
                    { routePropName: 'from', paramsPropName: 'from_params' },
                    { routePropName: 'to', paramsPropName: 'to_params' },
                ],
            },
            {
                import: '/route.jsx',
                props: [{ routePropName: 'path' }],
            },
        ],
        skipValidationPropName: 'skip',
        routeRegex,
        paramRegex,
    },
]
const ruleTester = new RuleTester()
ruleTester.run('react-link', reactLink, {
    valid: [
        {
            code: 'import "stuff"',
            options,
            parserOptions,
        },
        {
            code: 'import Link from "/link.jsx"; <Link to="/path" />',
            options,
            parserOptions,
        },
        {
            code: 'import Link from "/link.jsx"; const url = "example.com"; <Link to={url} skip />',
            options,
            parserOptions,
        },
        {
            code:
                'import Link from "/link.jsx"; var props = { other: "stuff" }; <Link to="/path" {...props} />',
            options,
            parserOptions,
        },
        {
            code:
                'import Redirect from "/redirect.jsx"; var bar = 1; <Redirect from="/foo" to="/foo/:foo/:bar" to_params={{ bar, foo: 1 }} />',
            options,
            parserOptions,
        },
        {
            code:
                'import Redirect from "/redirect.jsx"; var bar = "/bar"; <Redirect from="/foo" to={bar} skip />',
            options,
            parserOptions,
        },
        {
            code:
                'import ExternalLink from "/external_link.jsx"; var url = "example.com"; <ExternalLink to={url} />',
            options: [
                {
                    modules: [{ import: '/external_link.jsx' }],
                },
            ],
            parserOptions,
        },
        {
            code: 'import Route from "/route.jsx"; <Route path="/foo/:foo_id" />',
            options,
            parserOptions,
        },

        // <a href="..." />
        {
            code: 'function Button() { <a>button</a> }',
            options,
            parserOptions,
        },
        {
            code: 'function Button() { <a onClick={function () {}}>button</a> }',
            options,
            parserOptions,
        },
        {
            code: 'function Button() { <a href="javascript:void(0)">button</a> }',
            options,
            parserOptions,
        },
        {
            code: 'function Button() { <a href="javascript:void(0)" data-id="button">button</a> }',
            options,
            parserOptions,
        },
        {
            code: 'function Button() { <a href="#">link</a> }',
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
            code: 'import Link from "/link.jsx"; var foo = "/path"; <Link to={foo} />',
            options,
            parserOptions,
            errors: ['"to" property must be a string literal'],
        },
        {
            code: 'import Redirect from "/redirect.jsx"; var bar = "/bar"; <Redirect from="/foo" to={bar} />',
            options,
            parserOptions,
            errors: ['"to" property must be a string literal'],
        },
        {
            code: 'import Link from "/link.jsx"; <Link to="foo" />',
            options,
            parserOptions,
            errors: [`"foo" does not match routeRegex ${routeRegex}`],
        },
        {
            code: 'import Redirect from "/redirect.jsx"; <Redirect to="/:foo" />',
            options,
            parserOptions,
            errors: ['"to_params" prop missing'],
        },
        {
            code:
                'import Redirect from "/redirect.jsx"; var params = { foo: 1 } ;<Redirect to="/:foo" to_params={params} />',
            options,
            parserOptions,
            errors: ['"to_params" must be an object with keys declared inline'],
        },
        {
            code:
                'import Redirect from "/redirect.jsx"; <Redirect from="/:bar" from_params={{ foo: 1 }} to="/:foo/:bar" to_params={{ foo: 1 }} />',
            options,
            parserOptions,
            errors: [
                '"from_params" missing "bar" definition',
                '"from" missing "/:foo" in route',
                '"to_params" missing "bar" definition',
            ],
        },
        {
            code: 'import Redirect from "/redirect.jsx"; <Redirect to="/foo" from="/bar" skip />',
            options,
            parserOptions,
            errors: ['"skip" prop is not needed'],
        },
        {
            code:
                'import Redirect from "/redirect.jsx"; <Redirect to="/:foo1" from="/:foo-bar" to_params={{ foo1: 1 }} from_params={{ "foo-bar": 1 }}/>',
            options,
            parserOptions,
            errors: [
                `":foo-bar" does not match paramRegex ${paramRegex}`,
                `":foo1" does not match paramRegex ${paramRegex}`,
            ],
        },

        // <a href="..." />
        {
            code: 'function Button() { var props = { anything: "bar" }; <a {...props}>link</a> }',
            parserOptions,
            options,
            errors: [
                'Unable to determine value of href because of spread',
                '<a href /> can only be used as a button',
            ],
        },
        {
            code: 'function Button() { var url = "/foo"; <a href={url}>link</a> }',
            options,
            parserOptions,
            errors: ['<a href /> can only be used as a button'],
        },
        {
            code: 'function Button() { <a href="/foo">link</a> }',
            options,
            parserOptions,
            errors: ['<a href /> can only be used as a button'],
        },
        {
            code: 'function Button() { <a href="mailto:hello@example.com">link</a> }',
            options,
            parserOptions,
            errors: ['<a href /> can only be used as a button'],
        },
        {
            code: 'function Button() { <a href="/foo">link</a> }',
            options,
            parserOptions,
            errors: ['<a href /> can only be used as a button'],
        },
    ],
})

import { RuleTester, Linter } from 'eslint'
import { importBlacklist } from '../importBlacklist'

const parserOptions: Linter.ParserOptions = {
    ecmaFeatures: { jsx: true },
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
}
const ruleTester = new RuleTester()
ruleTester.run('import-blacklist', importBlacklist, {
    valid: [
        {
            code: 'import "foo"',
            options: [[{ import: 'bar' }]],
            parserOptions,
        },
        {
            code: 'import { Router } from "react-router"',
            options: [[{ import: 'react-router', allowAllExcept: ['Link'] }]],
            parserOptions,
        },
        {
            code: 'import { Router, Route } from "react-router"',
            options: [[{ import: 'react-router', allowAllExcept: ['Link'] }]],
            parserOptions,
        },
    ],
    invalid: [
        {
            code: 'import "foo"',
            parserOptions,
            errors: ['At least one option is required (ex. [{ import: "jquery" }]'],
        },
        {
            code: 'import "jquery"',
            options: [[{ import: 'jquery' }]],
            parserOptions,
            errors: ['"jquery" is blackedlisted'],
        },
        {
            code: 'import "prototype"',
            options: [[{ import: 'prototype', allowAllExcept: ['$'], reason: 'Browsers have caught up' }]],
            parserOptions,
            errors: ['{ $ } from "prototype" is blackedlisted (Browsers have caught up)'],
        },
        {
            code: 'import * as foo from "foo"',
            options: [[{ import: 'foo' }]],
            parserOptions,
            errors: ['"foo" is blackedlisted'],
        },
        {
            code: 'import * as router from "react-router"',
            options: [[{ import: 'react-router', allowAllExcept: ['Route'] }]],
            parserOptions,
            errors: ['{ Route } from "react-router" is blackedlisted'],
        },
        {
            code: 'import { Router, Route, Link } from "react-router"',
            options: [[{ import: 'react-router', allowAllExcept: ['Link'] }]],
            parserOptions,
            errors: ['{ Link } from "react-router" is blackedlisted'],
        },
        {
            code: 'import { Router, Route, Link, Redirect } from "react-router"',
            options: [[{ import: 'react-router', allowAllExcept: ['Link', 'Redirect'] }]],
            parserOptions,
            errors: ['{ Link, Redirect } from "react-router" is blackedlisted'],
        },
        {
            code: 'import _ from "underscore"; import backbone from "Backbone"',
            options: [
                [
                    { import: 'Backbone', reason: 'replaced with React' },
                    { import: 'underscore', reason: 'replaced with Lodash' },
                ],
            ],
            parserOptions,
            errors: [
                '"underscore" is blackedlisted (replaced with Lodash)',
                '"Backbone" is blackedlisted (replaced with React)',
            ],
        },
    ],
})

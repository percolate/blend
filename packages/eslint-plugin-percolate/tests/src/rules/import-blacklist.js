const rule = require('../../../lib/rules/import-blacklist')
const RuleTester = require('eslint').RuleTester

const parserOptions = {
    ecmaFeatures: { jsx: true },
    parser: 'babel-eslint',
    sourceType: 'module',
}
const ruleTester = new RuleTester()
ruleTester.run('import-blacklist', rule, {
    valid: [
        {
            code: 'import "foo"',
            options: [[{ module: 'bar' }]],
            parserOptions,
        },
        {
            code: 'import { Router } from "react-router"',
            options: [[{ module: 'react-router', allowAllExcept: ['Link'] }]],
            parserOptions,
        },
        {
            code: 'import { Router, Route } from "react-router"',
            options: [[{ module: 'react-router', allowAllExcept: ['Link'] }]],
            parserOptions,
        },
    ],
    invalid: [
        {
            code: 'import "foo"',
            parserOptions,
            errors: ['At least one option is required (ex. [{ module: "jquery" }]'],
        },
        {
            code: 'import "jquery"',
            options: [[{ module: 'jquery' }]],
            parserOptions,
            errors: ['"jquery" is blackedlisted'],
        },
        {
            code: 'import "prototype"',
            options: [[{ module: 'prototype', allowAllExcept: ['$'], reason: 'Browsers have caught up' }]],
            parserOptions,
            errors: ['{ $ } from "prototype" is blackedlisted (Browsers have caught up)'],
        },
        {
            code: 'import * as foo from "foo"',
            options: [[{ module: 'foo' }]],
            parserOptions,
            errors: ['"foo" is blackedlisted'],
        },
        {
            code: 'import * as router from "react-router"',
            options: [[{ module: 'react-router', allowAllExcept: ['Route'] }]],
            parserOptions,
            errors: ['{ Route } from "react-router" is blackedlisted'],
        },
        {
            code: 'import { Router, Route, Link } from "react-router"',
            options: [[{ module: 'react-router', allowAllExcept: ['Link'] }]],
            parserOptions,
            errors: ['{ Link } from "react-router" is blackedlisted'],
        },
        {
            code: 'import { Router, Route, Link, Redirect } from "react-router"',
            options: [[{ module: 'react-router', allowAllExcept: ['Link', 'Redirect'] }]],
            parserOptions,
            errors: ['{ Link, Redirect } from "react-router" is blackedlisted'],
        },
        {
            code: 'import _ from "underscore"; import backbone from "Backbone"',
            options: [
                [
                    { module: 'Backbone', reason: 'replaced with React' },
                    { module: 'underscore', reason: 'replaced with Lodash' },
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

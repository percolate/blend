const rule = require('../../../lib/rules/no-react-proptypes')
const RuleTester = require('eslint').RuleTester
const { resolve } = require('path')

const filename = resolve(__dirname, '../../fixtures/foo.js')
const parserOptions = {
    ecmaVersion: 6,
    sourceType: 'module',
}
const ruleTester = new RuleTester()
ruleTester.run('no-react-proptypes', rule, {
    valid: [
        {
            code: 'import PropTypes from "prop-types"',
            filename,
            parserOptions,
        },
    ],
    invalid: [
        {
            code: 'import React, { PropTypes } from "react"',
            filename,
            parserOptions,
            errors: ['React.PropTypes is deprecated. Please import "prop-types" module.'],
        },
        {
            code: `
                import React from "react"
                const propTypes = {
                    foo: React.PropTypes.string
                }
            `,
            filename,
            parserOptions,
            errors: ['React.PropTypes is deprecated. Please import "prop-types" module.'],
        },
    ]
})

import { Linter, RuleTester } from 'eslint'
import { resolve } from 'path'

import { noReactPropTypes } from '../noReactPropTypes'

const filename = resolve(__dirname, './fixtures/foo.js')
const parserOptions: Linter.ParserOptions = {
    ecmaVersion: 2015,
    sourceType: 'module',
}
const ruleTester = new RuleTester()
ruleTester.run('no-react-proptypes', noReactPropTypes, {
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
    ],
})

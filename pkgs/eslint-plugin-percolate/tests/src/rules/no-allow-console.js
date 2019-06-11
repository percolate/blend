const rule = require('../../../lib/rules/no-allow-console')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester()

ruleTester.run('no-allow-console', rule, {
    valid: [],
    invalid: [
        {
            code: 'this.allowConsole()',
            errors: ['Console output should be handled or mocked'],
        },
        {
            code: 'allowConsole.call(this)',
            errors: ['Console output should be handled or mocked'],
        },
    ],
})

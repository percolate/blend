const rule = require('../../../lib/rules/no-allow-console')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester()

ruleTester.run('no-allow-console', rule, {
    valid: [],
    invalid: [
        {
            code: 'this.allowConsole()',
            errors: ['allowConsole is forbidden'],
        },
        {
            code: 'allowConsole.call(this)',
            errors: ['allowConsole is forbidden'],
        },
    ],
})

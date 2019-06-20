import { RuleTester } from 'eslint'
import { noAllowConsole } from '../noAllowConsole'

const ruleTester = new RuleTester()
ruleTester.run('no-allow-console', noAllowConsole, {
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

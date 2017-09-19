const rule = require('../../../lib/rules/fake-server')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester()

ruleTester.run('fake-server', rule, {
    valid: [],
    invalid: [
        {
            code: 'this.fakeServer.respond()',
            errors: ['Promises make fakeServer.respond() please use respondWith'],
        },
        {
            code: 'fakeServer.respond()',
            errors: ['Promises make fakeServer.respond() please use respondWith'],
        },
        {
            code: 'fakeServer.respondTo()',
            errors: ['fakeServer.respondTo() is deprecated in favor of respondWith'],
        },
        {
            code: 'fakeServer.promiseRespond()',
            errors: ['fakeServer.promiseRespond() is deprecated in favor of respondWith'],
        },
        {
            code: 'fakeServer.promiseRespondTo()',
            errors: ['fakeServer.promiseRespondTo() is deprecated in favor of respondWith'],
        },
        {
            code: 'this.fakeServer.autoRespond = false',
            errors: ['should always be true because fakeServer.respond() is no longer async'],
        },
        {
            code: 'this.fakeServer.autoRespond = true',
            errors: ['fakeServer.autoRespond is on by default'],
        },
    ],
})

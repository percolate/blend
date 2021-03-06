import { RuleTester } from 'eslint'

import { fakeServer } from '../fakeServer'

const ruleTester = new RuleTester()
ruleTester.run('fake-server', fakeServer, {
    valid: [],
    invalid: [
        {
            code: 'this.fakeServer.respond()',
            errors: ['fakeServer.respond is no longer synchronous'],
        },
        {
            code: 'fakeServer.respond()',
            errors: ['fakeServer.respond is no longer synchronous'],
        },
        {
            code: 'fakeServer.respondTo()',
            errors: ['fakeServer.respondTo is deprecated in favor of respondWith'],
        },
        {
            code: 'fakeServer.promiseRespond()',
            errors: ['fakeServer.promiseRespond is deprecated in favor of respondWith'],
        },
        {
            code: 'fakeServer.promiseRespondTo()',
            errors: ['fakeServer.promiseRespondTo is deprecated in favor of respondWith'],
        },
        {
            code: 'this.fakeServer.autoRespond = false',
            errors: ['fakeServer.respond is no longer synchronous'],
        },
        {
            code: 'this.fakeServer.autoRespond = true',
            errors: ['autoRespond is on by default'],
        },
    ],
})

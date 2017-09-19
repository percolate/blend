# Sinon fake server rules (fake-server)

## Rule Details

Examples of **incorrect** code for this rule:

```js

it('should...', function() {
    this.fakeServer.autoRespond = true  // fakeServer.autoRespond is on by default
    this.fakeServer.autoRespond = false // should always be true because fakeServer.respond() is no longer async

    this.fakeServer.respond()           // Promises make fakeServer.respond() please use respondWith

    this.fakeServer.promiseRespond()    // fakeServer.promiseRespond() is deprecated in favor of respondWith
    this.fakeServer.promiseRespondTo()  // fakeServer.promiseRespondTo() is deprecated in favor of respondWith
    this.fakeServer.respondTo()         // fakeServer.respondTo() is deprecated in favor of respondWith
})
```

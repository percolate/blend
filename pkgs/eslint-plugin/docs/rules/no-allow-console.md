# Forbids calling `this.allowConsole()` (no-allow-console)

## Rule Details

Examples of **incorrect** code for this rule:

```js
// given filename /path/to/test.js
beforeEach(function () {
    this.allowConsole()
})

it('should ...', function () {
    allowConsole.call(this)
})
```

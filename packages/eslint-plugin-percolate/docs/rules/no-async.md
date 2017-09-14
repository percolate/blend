# No async (no-async)

This can be a potential error if your browser doesn't support async/await

## Rule Details

Examples of **incorrect** code for this rule:

```js
async function getFoo() {
    await foo()
}
```

Examples of **correct** code for this rule:

```js
function getFoo() { return foo() }
```

## When Not To Use It

If you're using a polyfill
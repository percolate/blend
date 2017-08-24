# Enforces a test suite name matches the filename (test-suite-name)

This ensures that test suite names are unique across files.
It can also be useful when other tools rely on the test suite name to generate snapshots.

## Rule Details

Examples of **incorrect** code for this rule:

```js

// given filename /path/to/test.js
describe('Test')
describe('/other/path/to/test')
describe('/path/to/test.js')

```

Examples of **correct** code for this rule:

```js

// given filename /path/to/test.js
describe('/path/to/test')

```

## When Not To Use It

If you don't care about test suite naming conventions

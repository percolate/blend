# Verifies that commonJS `require(...).default` and `export default...` are in sync (cjs-default)

For commonJS, reports if commonJS `require(...).default` and the referenced default export are out of sync. Intended for temporary use when migrating to pure ES6 modules.

This rule is built on top of [eslint-plugin-import][eslint-plugin-import] and leverages its settings `import/*` (most notably `import/resolver`).

## Rule Details

Examples of **incorrect** code for this rule:

```js
// bar.js
// export function bar () {...}

// foo.js
// export default function foo () {...}

var bar = require('./bar').default // no default export found in ./bar
var foo = require('./foo') // requiring ES module must reference default
```

Examples of **correct** code for this rule:

```js
// bar.js
// export function bar () {...}

// foo.js
// export default function foo () {...}

var bar = require('./bar')
var foo = require('./foo').default
```

## When Not To Use It

If you are using CommonJS and [properly hanlding default][babel-plugin] and/or modifying the exported namespace of any module at runtime, you will likely see false positives with this rule.

[babel-plugin]: https://www.npmjs.com/package/babel-plugin-add-module-exports
[eslint-plugin-import]: https://github.com/benmosher/eslint-plugin-import

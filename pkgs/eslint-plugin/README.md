# @percolate/eslint-plugin

Percolate ESlint configs/rules optimized for TypeScript.

## Installation

```
$ yarn add @percolate/eslint-plugin --dev
```

## Usage

### Node

```js
// .eslintrc.js
module.exports = {
    extends: ['plugin:@percolate/base', 'plugin:@percolate/node'],
    rules: {
        // configure rule
        '@percolate/import-blacklist': [
            'error',
            [
                {
                    import: 'underscore',
                    reason: 'Use lodash instead',
                },
            ],
        ],
    },
}
```

### React

React, be sure to leverage the following config:

```js
// .eslintrc.js
module.exports = {
    extends: ['plugin:@percolate/base', 'plugin:@percolate/react'],
}
```

### `eslint-plugin-import`

The rule `import/no-unresolved` is on by default which means [eslint-plugin-import](https://www.yarnpkg.com/en/package/eslint-plugin-import) has to be configured.
`plugin:@percolate/node` configures [eslint-import-resolver-node](https://www.yarnpkg.com/en/package/eslint-import-resolver-node) automatically.

#### Webpack

If you're using Webpack, you'll need to `yarn add eslint-import-resolver-webpack --dev` and configure it:

```js
// .eslintrc.js
module.exports = {
    extends: ['plugin:@percolate/base', 'plugin:@percolate/react'],
    settings: {
        'import/resolver': {
            'eslint-import-resolver-webpack': {
                config: 'webpack.dev.config.js',
            },
        },
    },
}
```

## Supported Configs

-   [See configs](src/configs)

## Supported Rules

-   [See rules](docs/rules)

---

[See root README.md](https://github.com/percolate/blend/blob/master/README.md)

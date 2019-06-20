# @percolate/eslint-plugin

Percolate ESlint configs/rules optimized for TypeScript.
We specifically defined `peerDependencies` as `dependencies` to help maintaince of package versions across repos.

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
`plugin:@percolate/node` enables [plugin:import/typescript](https://github.com/benmosher/eslint-plugin-import#typescript) with node resolution for you.

If you're using Webpack, you'll need to configure it:

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

_Note:_ both [eslint-import-resolver-node](https://www.yarnpkg.com/en/package/eslint-import-resolver-node) and [eslint-import-resolver-webpack](https://www.yarnpkg.com/en/package/eslint-import-resolver-webpack) come pre-installed with this package.

## Supported Configs

-   [See configs](src/configs)

## Supported Rules

-   [See rules](docs/rules)

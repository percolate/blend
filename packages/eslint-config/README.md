# Percolate's [eslint](http://eslint.org/) config

Percolate's JavaScript style guide.

## Installation

```sh
$ npm install prclt-eslint-config
```

## Usage

[Extend](http://eslint.org/docs/developer-guide/shareable-configs) your local `.eslintrc` configuration:

```json
{
  "extends": "./node_modules/prclt-eslint-config/.eslintrc"
}
```

Or use the package directly:

```sh
$ ./node_modules/prclt-eslint-config/node_modules/.bin/eslint -c ./node_modules/prclt-eslint-config/.eslintrc ./lib/ ./test/
```

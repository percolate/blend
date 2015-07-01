# eslint-config-percolate

[![Circle CI](https://circleci.com/gh/percolate/eslint-config-percolate.svg?style=svg&circle-token=a2dfaae06d0d2ce659ee32eb8b060d602d58445c)](https://circleci.com/gh/percolate/eslint-config-percolate)

Percolate's JavaScript style guide.

## Installation

```sh
$ npm install git+https://git@github.com/percolate/eslint-config-percolate.git
```

## Usage

[Extend](http://eslint.org/docs/developer-guide/shareable-configs) your local `.eslintrc` configuration:

```json
{
  "extends": "./node_modules/eslint-config-percolate/.eslintrc"
}
```

Or use the package directly:

```sh
$ ./node_modules/eslint-config-percolate/node_modules/.bin/eslint -c ./node_modules/eslint-config-percolate/.eslintrc ./lib/ ./test/
```

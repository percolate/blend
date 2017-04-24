# eslint-plugin-percolate

Percolate's custom Eslint rules

## Installation

You'll first need to install [ESLint](http://eslint.org) and [eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import):

```
$ npm i eslint eslint-plugin-import --save-dev
```

Next, install `eslint-plugin-percolate`:

```
$ npm install eslint-plugin-percolate --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-percolate` globally.

## Usage

Add `percolate` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "percolate"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "percolate/cjs-default": "error",
        "percolate/no-jsx-id-attrs": "error",
    }
}
```

## Supported Rules

* [cjs-default](docs/rules/cjs-default.md): Verifies that commonJS `require(...).default` and `export default ...` are in sync
* [no-jsx-id-attrs](docs/rules/no-jsx-id-attrs.md): Prevents "id" attribute on DOM elements in JSX

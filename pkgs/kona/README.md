# @percolate/kona

Kona is set of scripts and configs used to provide a consistent dev experience across NodeJS repos.

```
kona <command>

Commands:
  kona config                  Print `.konarc` including defaults
  kona commit [files..]        Commit message prompter (commitizen)
  kona coverage                Check diff coverage (bypass with "[skip coverage]" in latest commit message)
  kona lint [files..]          Apply ESLint and Prettier
  kona test [TestPathPattern]  Jest (simplified)
  kona ts [path..]             Type check with TypeScript
  kona verify                  Verify repo setup and dependencies

Options:
  --version   Show version number                                                                    [boolean]
  -h, --help  Show help                                                                              [boolean]
```

## Installation

```sh
yarn add @percolate/kona --dev
npx kona -h
```

### Configure Jest

`@percolate/kona` provides a `jest` config setup specifically for `npx kona test`, `npx kona coverage`, and CI.
You'll need to provide the following jest config in your repo's root or each monorepo packages.

```js
// jest.config.js
const { jest } = require('@percolate/kona')
module.exports = {
    ...jest,
    // custom overrides
}
```

Visit [src/jest.ts](https://github.com/percolate/blend/blob/master/pkgs/kona/src/jest.ts) to see full configuration.

### CI

At Percolate, we enforce the following across all NodeJS repos in our CI:

```sh
# Verify repo setup and dependencies
npx kona verify

# Validate commit messages of current branch
npx kona commit validate

# Type check with TypeScript
npx kona ts

# Check ESLint and Prettier
npx kona lint

# run Jest and check diff coverage (bypass with "[skip coverage]" in latest commit message)
npx kona test --coverage && npx kona coverage
```

It's also be a good idea to provide NPM scripts as aliases more familiar to devs:

```json
// package.json
{
    "scripts": {
        "coverage": "kona test --coverage && kona coverage",
        "lint": "kona lint",
        "test": "kona test --watch",
        "types": "kona ts"
        // ...
    }
}
```

### .konarc

If you'd like to override kona's default values (see `npx kona config`), create a JSON file `.konarc` to the root of your repo.

Visit [src/config.ts](https://github.com/percolate/blend/blob/master/pkgs/kona/src/config.ts) for more details.

You can access your kona's config with your values programmatically.

```ts
import { config } from '@percolate/kona'
console.log(config)
```

## Configs

Kona ships with commonly used static configs (ex. `.vscode/settings.json`, `tsconfig.json`...).
They are located in [configs/](./configs/).

```json
// tsconfig.js
{
    "extends": "@percolate/kona/configs/tsconfig.json"
}
```

```sh
# symlink .vscode config in your project
ln -s node_modules/@percolate/kona/configs/.vscode .vscode
```

## Development

```sh
yarn watch
```

`yarn run` for all options.

---

[See root README.md](https://github.com/percolate/blend/blob/master/README.md)

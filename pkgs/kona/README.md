# @percolate/kona

This repos aims to provide common CLI and configs used across multiple repos.

## Setting up a new repo

```sh
yarn add @percolate/kona --dev
npx kona verify
```

## Static configs

Basic configs serve the purpose of standardizing expectations by setting a constant base.
They're located in [configs/](./configs/).
If the same config is used across multiple repos, it can become a base.

In most cases, you'll use node's module resolution to include them or a symlink.

```ts
// tsconfig.js
{
    "extends": "@percolate/kona/configs/tsconfig.json",
}
```

```sh
# symlink .vscode config in your project
ln -s node_modules/@percolate/kona/configs/.vscode .vscode
```

## API

The goal of the API is to provide a way to import complex configs (ex. `[jest](./src/jest.ts`), partial configs, and utils.
Since the interface is fully typed, you can inspect `@percolate/kona`'s export object to see what's available.

```ts
import * as kona from '@percolate/kona'
```

## CLI

```
$ npx kona -h
kona <command>

Commands:
  kona config                  Prints .konarc values with defaults
  kona commit [files..]        Commit message
  kona coverage                Report test coverage on git diff
  kona lint [files..]          Lints source for proper coding styles
  kona test [TestPathPattern]  Jest (simplified)
  kona ts                      Run type checking only
  kona verify                  Verifies project is setup properly

Options:
  --version   Show version number                                                                    [boolean]
  -h, --help  Show help                                                                              [boolean]
```

## Development

```sh
yarn dev
```

`yarn run` for all options.

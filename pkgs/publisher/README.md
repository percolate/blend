# @percolate/publisher

CI publisher which publihes to NPM if the version in `package.json` is newer than the published version.

```
Publish package if the package.json version is newer than NPM's

Usage:
    publish [options]
    publish -h | --help

Options:
    -h --help  Show this screen
```

# Usage

```bash
yarn add @percolate/publisher --dev

# provide an NPM token with write access
echo "//registry.npmjs.org/:_authToken=$NPMJS_TOKEN" >> ~/.npmrc

npx publish
```

## Development

```sh
yarn watch
```

`yarn run` for all options.

---

[See root README.md](https://github.com/percolate/blend/blob/master/README.md)

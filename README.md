# Blend

[![CircleCI](https://circleci.com/gh/percolate/blend.svg?style=svg&circle-token=74899ca7ec259f273f7002dce8b6a7ab6bd89bc3)](https://circleci.com/gh/percolate/blend)
[![codecov](https://codecov.io/gh/percolate/blend/branch/master/graph/badge.svg?token=S3DgH9fGU2)](https://codecov.io/gh/percolate/blend)

A blend of libraries, tooling, and containers.

Blend is setup as a monorepo with each package living under [pkgs/](pkgs/).
A lot of packages are applied to this monorepo which is a good example of how we use them.

## Development

```sh
# install environment (dependencies, build)
make install

# see root scripts
yarn run

# run @percolate/kona against this repo
npx kona -h
```

Most package support the following commands:

```sh
cd pkgs/*

# build package pkgs/*/dist
yarn build

# start a watcher
yarn watch

# see package specific scripts
yarn run
```

## Publishing

All packages are published under the [@percolate](https://www.npmjs.com/org/percolate) organization on NPM.

1. Open a PR with your changes
2. Once your PR is approved (but not merged), run `yarn lerna:version` on your local branch and follow the instructions
3. Merge your PR into master
4. CircleCI will deploy master automatically by checking which package versions haven't been published yet and then publish them

## License

See [LICENSE](LICENSE.md).

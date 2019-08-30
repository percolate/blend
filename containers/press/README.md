# percolate/blend/press

Containerized version of `pkgs/press`

## building and publishing

`@percolate/press` relies on other packages in this monorepo (ex. `@percolate/cli-utils`).
By splitting the build process, we're able to simplify the docker build logic drastrically and optimize the image to only include runtime dependencies.

1. build and publish `@percolate/press` (npm package):
    1. install blend dependencies to build packages
    1. build `@percolate/press` and its dependencies
    1. publish `@percolate/press` [NPM](https://www.npmjs.com/package/@percolate/press).
1. build and publish `blend/press` (docker image):
    1. build docker image off latest `@percolate/press` version
    1. leverage `@percolate/press` to push image

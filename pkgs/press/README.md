# @percolate/press

CI release tooling

```
press <command>

Commands:
  press push <image>  Push docker image to ECR
  press release       Creates a Sentry release

Options:
  -h, --help  Show help                                               [boolean]
```

## Install

```sh
yarn add @percolate/press
npx press -h
```

## Development

```sh
yarn watch
```

`yarn run` for all options.

### Testing profiles

Given the following aws config/credentials:

```ini
# ~/.aws/config
[profile my_profile]
role_arn = ...
source_profile = default
region = us-east-1
```

```ini
# ~/.aws/credentials
[default]
aws_access_key_id = ...
aws_secret_access_key = ...
```

```sh
npx press push --profile=my_profile --region=us-east-1
```

Important: `aws-sdk` supports profiles for `~/.aws/credentials` but not `~/.aws/config` which is why the `--region` needs to be specified.

## Containerized version

A containerized version of `@percolate/press` can be found at 667005031541.dkr.ecr.us-west-1.amazonaws.com/percolate/blend/press:latest

### Usage example

Here's an example of a CircleCI config which leverages `percolate/blend/press` to push an image.
Please note that the docker build process is completely independent which means it can moved to a separate job (ideally one that runs in parallel with tests).

```yaml
version: 2

jobs:
    my_job:
        docker:
            - image: 667005031541.dkr.ecr.us-west-1.amazonaws.com/percolate/blend/press:version-0.0.1
        steps:
            - checkout
            - setup_remote_docker
            - run: docker build --tag my_image .
            - run: npx press push my_image # --fromArchive=/path/my_image.tar if image comes from `attach_workspace`
            - run: npx press release
```

### building and publishing

`@percolate/press` relies on other packages in this monorepo (ex. `@percolate/cli-utils`).
By splitting the build process, we're able to simplify the docker build logic drastrically and optimize the image to only include runtime dependencies.

Build flow:

1. build and publish `@percolate/press` (npm package):
    1. install blend dependencies to build packages
    1. build `@percolate/press` and its dependencies
    1. publish `@percolate/press` [NPM](https://www.npmjs.com/package/@percolate/press).
1. build and publish `blend/press` (docker image):
    1. build docker image off latest `@percolate/press` version
    1. leverage `@percolate/press` to push image

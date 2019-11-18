# @percolate/press

CI release tooling

```
press <command>

Commands:
  press push <image>  Push docker image to ECR
  press release       Create and finalize a Sentry release
  press sentry-cli    sentry-cli proxy with master gating and project injection

Options:
  --version   Show version number                                      [boolean]
  -h, --help  Show help                                                [boolean]
```

## Usage

```sh
yarn add @percolate/press --dev
npx press -h
```

## Development

```sh
yarn watch
```

`yarn run` for all options.

### Testing profiles

Given the following AWS config/credentials:

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

A containerized version of `@percolate/press` can be found on our private registry 667005031541.dkr.ecr.us-west-1.amazonaws.com/percolate/blend/press:latest

### Usage example

Here's an example of a CircleCI config which leverages `percolate/blend/press` to push `my_image`.
`test` and `build` can be parallelized to speed up the whole workflow.

```yaml
version: 2.1

executors:
    press:
        docker:
            # please replace `latest` with specific version
            - image: 667005031541.dkr.ecr.us-west-1.amazonaws.com/percolate/blend/press:latest

jobs:
    test: # custom tests go here

    build:
        executor: press
        steps:
            - checkout
            - setup_remote_docker
            # VERSION must match `press release --version=${VERSION}` (defaults to `${CIRCLE_SHA1}`)
            - run: docker build --tag my_image . --build-arg VERSION=${CIRCLE_SHA1}
            - run: docker save my_image > /tmp/my_image.tar
            - persist_to_workspace:
                  root: /tmp
                  paths:
                      - my_image.tar
    release:
        executor: press
        steps:
            - checkout
            - attach_workspace:
                  at: /tmp
            - setup_remote_docker
            - run: press push my_image --fromArchive=/tmp/my_image.tar
            - run: press release

workflows:
    version: 2
    my_repo:
        jobs:
            - test
            - build
            - release:
                  # context contains sentry org, token, and uri as env vars
                  context: sentry
                  requires:
                      - test
                      - build
```

### building and publishing

`@percolate/press` relies on other packages in this monorepo (ex. `@percolate/cli-utils`).
By splitting the build process, we're able to simplify the docker build logic drastrically and optimize the image to only include runtime dependencies.

Build flow found in [.circleci/config.yml](https://github.com/percolate/blend/blob/master/.circleci/config.yml) for details.:

1. build and publish `@percolate/press` to NPM:
    1. install blend dependencies to build packages
    1. build `@percolate/press` and its dependencies
    1. publish `@percolate/press` [NPM](https://www.npmjs.com/package/@percolate/press).
1. build and publish `percolate/blend/press` to ECR:
    1. build docker image off latest `@percolate/press` version
    1. leverage `@percolate/press` to push image

---

[See root README.md](https://github.com/percolate/blend/blob/master/README.md)

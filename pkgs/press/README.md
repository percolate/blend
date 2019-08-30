# @percolate/press

CI Release tooling

```
press <command>

Commands:
  press push <image>  Push docker image to ECR
  press release       Creates a Sentry release

Options:
  -h, --help  Show help                                                                              [boolean]
```

## Setting up a new repo

```sh
yarn add @percolate/press
npx press -h
```

## Development

```sh
yarn watch
```

`yarn run` for all options.

## Testing profiles

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

Important: `aws-sdk` supports profiles for `~/.aws/credentials` but not `~/.aws/config` which is why the `--regrion` needs to be specified.

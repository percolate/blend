# blend

[![CircleCI](https://circleci.com/gh/percolate/blend.svg?style=svg&circle-token=74899ca7ec259f273f7002dce8b6a7ab6bd89bc3)](https://circleci.com/gh/percolate/blend)
[![codecov](https://codecov.io/gh/percolate/blend/branch/master/graph/badge.svg?token=S3DgH9fGU2)](https://codecov.io/gh/percolate/blend)

Tooling for frontend repos

## Development

```
./bin/install
```

## Publishing

Publishing is done in two parts:
1. "pre-publish" handled by you, the user
1. "publish" handled by CircleCI which deploys master automatically by checking which package versions haven't been published yet.

```
# follow instructions
./bin/prepublish
```

## License

See [LICENSE](/LICENSE.md).

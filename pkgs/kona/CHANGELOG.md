# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.1](https://github.com/percolate/blend/tree/master/pkgs/kona/compare/@percolate/kona@3.0.0...@percolate/kona@3.0.1) (2019-09-06)

**Note:** Version bump only for package @percolate/kona





# [3.0.0](https://github.com/percolate/blend/tree/master/pkgs/kona/compare/@percolate/kona@2.2.2...@percolate/kona@3.0.0) (2019-08-28)


### Bug Fixes

* color util now requires style ([622fbb5](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/622fbb5))
* remove bluebird dependency from parallelize ([cf20901](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/cf20901))
* remove unused noStack ([f3de407](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/f3de407))
* use yargs’ non-singleton interface ([672ae8b](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/672ae8b))


### Code Refactoring

* remove @percolate/cli-utils exports ([9d25216](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/9d25216))


### BREAKING CHANGES

* consumers should import @percolate/cli-utils directly
* It doesn't make sense to call color without passing in a style





## [2.2.2](https://github.com/percolate/blend/tree/master/pkgs/kona/compare/@percolate/kona@2.2.1...@percolate/kona@2.2.2) (2019-07-13)


### Bug Fixes

* remove restoreMocks ([734596a](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/734596a))





## [2.2.1](https://github.com/percolate/blend/tree/master/pkgs/kona/compare/@percolate/kona@2.2.0...@percolate/kona@2.2.1) (2019-07-12)


### Bug Fixes

* add more js/jsx extensions to default testMatch ([8af95cf](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/8af95cf))
* add TEST_DEBUG based on --debug argv ([8d5183b](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/8d5183b))
* kona verify error count ([ac0fd63](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/ac0fd63))
* rename resetMocks to restoreMocks ([fdc8d0b](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/fdc8d0b))





# [2.2.0](https://github.com/percolate/blend/tree/master/pkgs/kona/compare/@percolate/kona@2.1.1...@percolate/kona@2.2.0) (2019-07-09)


### Features

* add ability to filter paths to kona ts [path..] ([a8e0283](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/a8e0283))





## [2.1.1](https://github.com/percolate/blend/tree/master/pkgs/kona/compare/@percolate/kona@2.1.0...@percolate/kona@2.1.1) (2019-07-09)


### Bug Fixes

* bin/coverage now looks for lcov*.info ([6cc83ba](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/6cc83ba))





# [2.1.0](https://github.com/percolate/blend/tree/master/pkgs/kona/compare/@percolate/kona@2.0.1...@percolate/kona@2.1.0) (2019-07-09)


### Bug Fixes

* add resetMocks: true to jest ([80a4833](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/80a4833))
* remove duplicate config[key] assignment ([a7b84d8](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/a7b84d8))


### Features

* add fs/ensureDir ([179bd8b](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/179bd8b))
* add git/isLatestHash ([5e3b3ec](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/5e3b3ec))
* add kona config ([93e4652](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/93e4652))
* add kona coverage —dir options ([fba0b39](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/fba0b39))
* export utils ([db77125](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/db77125))





## [2.0.1](https://github.com/percolate/blend/tree/master/pkgs/kona/compare/@percolate/kona@2.0.0...@percolate/kona@2.0.1) (2019-07-03)

**Note:** Version bump only for package @percolate/kona





# [2.0.0](https://github.com/percolate/blend/tree/master/pkgs/kona/compare/@percolate/kona@1.0.0...@percolate/kona@2.0.0) (2019-07-02)


### Bug Fixes

* add more extensions to code coverage ([832c39d](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/832c39d))
* build scripts ([b6ead64](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/b6ead64))
* removed npx usage for prettier ([6432b47](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/6432b47))


### Build System

* replace babel-cli with tsc —build ([e58fafc](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/e58fafc))


### BREAKING CHANGES

* Removed tsconfig.types.json and rename tsconfig.base.json to tsconfig.json





# [1.0.0](https://github.com/percolate/blend/tree/master/pkgs/kona/compare/@percolate/kona@0.1.0...@percolate/kona@1.0.0) (2019-07-01)


### Bug Fixes

* “kona commit validate” checks commitLintPaths setup ([b1ec350](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/b1ec350))
* renamed .percolaterc to .konarc ([2efaaa7](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/2efaaa7))


### BREAKING CHANGES

* Renamed .percolaterc to .konarc





# 0.1.0 (2019-06-28)


### Bug Fixes

* .eslintignore works when eslint is run in root ([a72ce81](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/a72ce81))
* kona commit and add support to passing files ([0a878c5](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/0a878c5))
* typo ([a89bbe1](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/a89bbe1))


### Features

* add alias to commit ([7bca4a2](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/7bca4a2))
* default `kona lint --no-fix` to true if CI ([96e58a9](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/96e58a9))
* introduce @percolate/kona ([36007ae](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/36007ae))
* introduce kona verify ([69f14d8](https://github.com/percolate/blend/tree/master/pkgs/kona/commit/69f14d8))

.DEFAULT_GOAL := install

install:
	yarn install --pure-lockfile
	npx lerna run build

prepublish:
	bin/prepublish

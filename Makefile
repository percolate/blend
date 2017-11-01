.DEFAULT_GOAL := install

install:
	yarn install --pure-lockfile
	./node_modules/.bin/lerna bootstrap -- --pure-lockfile

prepublish:
	bin/prepublish

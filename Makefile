.DEFAULT_GOAL := install

install:
	yarn install --frozen-lockfile
	npx lerna run build

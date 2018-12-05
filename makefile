.PHONY: default install run test build

export UID = $(shell id -u)
export GID = $(shell id -g)

export PGHOST ?= localhost
export PGDATABASE ?= postgres
export PGUSER ?= postgres
export PGPASSWORD ?= postgres

build:
	node_modules/babel-cli/bin/babel.js lib -d build --ignore *.spec.js
	cp package.json ./build/package.json
	cp README.md ./build/README.md

test:
	($(MAKE) test-start && $(MAKE) stop-db) || ($(MAKE) stop-db && exit 1)

start-db:
	@docker run --name co-postgres-queries-db -p "5432:5432" -d postgres
	@sleep 3s # Let the DB start

stop-db:
	@docker stop co-postgres-queries-db
	@docker rm co-postgres-queries-db

test-start: start-db
	@npm run test

install:
	npm install

publish:
	make build
	cd build && npm publish

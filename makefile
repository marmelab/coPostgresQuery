.PHONY: default install run test build

# If the first argument is one of the supported commands...
SUPPORTED_COMMANDS := npm
SUPPORTS_MAKE_ARGS := $(findstring $(firstword $(MAKECMDGOALS)), $(SUPPORTED_COMMANDS))
ifneq "$(SUPPORTS_MAKE_ARGS)" ""
    # use the rest as arguments for the command
    COMMAND_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
    # ...and turn them into do-nothing targets
    $(eval $(COMMAND_ARGS):;@:)
endif

build:
	docker-compose run node node_modules/babel-cli/bin/babel.js lib -d build --blacklist regenerator --ignore *.spec.js
	cp package.json ./build/package.json
	cp README.md ./build/README.md

test:
	@docker-compose up -d db
	@sleep 3s # Let the DB start
	@docker-compose run test

install:
	docker-compose run --rm npm install

npm:
	docker-compose run --rm npm $(COMMAND_ARGS)

publish:
	make build
	cd build && npm publish

.PHONY: default install run test

test:
	@node_modules/mocha/bin/mocha --harmony test/setup.js test/**/*.js

install:
	npm ci

test:
	npm test

debug-axios:
	DEBUG=axios npm test

debug-nock:
	DEBUG=nock.* npm test

debug-loader:
	DEBUG=page-loader npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

lint-fix:
	npx eslint --fix .

.PHONY: test

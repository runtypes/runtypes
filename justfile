@_:
	just --list

setup:
	chmod +x .githooks/*
	git config --local core.hooksPath .githooks
	corepack enable
	pnpm install

test *ARGS='src/**/*.test.ts src/*.test.ts':
	deno test --coverage=coverage --allow-net --allow-read {{ARGS}}
	deno coverage coverage

ci *ARGS='src/**/*.test.ts src/*.test.ts':
	deno test --coverage=coverage --allow-net --allow-read {{ARGS}}
	deno coverage --lcov coverage > coverage/coverage.lcov

build:
	deno run -A build.ts

check *ARGS='src/**/*.ts src/*.test.ts examples/**/*.ts examples/*.ts':
	deno check {{ARGS}}

pack: build
	cd lib && pnpm pack
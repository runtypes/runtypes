@_:
	just --list

setup:
	chmod +x .githooks/*
	git config --local core.hooksPath .githooks

test:
	deno test --coverage=coverage --allow-net --allow-read 'src/**/*.test.ts'
	deno coverage coverage

ci:
	deno test --coverage=coverage --allow-net --allow-read 'src/**/*.test.ts'
	deno coverage --lcov coverage > coverage/coverage.lcov

build:
	deno run -A build.ts

pack: build
	cd lib && pnpm pack
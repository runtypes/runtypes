/* eslint-disable import/no-unused-modules */
import packageBuildJson from "./package.build.json" with { type: "json" }
import { build, emptyDir } from "jsr:@deno/dnt@0.41.3"

await emptyDir("./lib")

await build({
	entryPoints: ["./src/index.ts"],
	outDir: "./lib",
	shims: {
		// see JS docs for overview and more options
		deno: true,
	},
	package: packageBuildJson,
	packageManager: "pnpm",
	typeCheck: false,
	test: false,
	skipSourceOutput: true,
})

// post build steps
Deno.copyFileSync("LICENSE", "./lib/LICENSE")
Deno.copyFileSync("README.md", "./lib/README.md")
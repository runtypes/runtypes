/* eslint-disable import/no-unused-modules */
import packageBuildJson from "./package.build.json" with { type: "json" }
import { build, emptyDir } from "jsr:@deno/dnt@0.41.3"

await emptyDir("./build")

await build({
	entryPoints: ["./src/index.ts"],
	outDir: "./build",
	shims: {},
	package: packageBuildJson,
	packageManager: "pnpm",
	typeCheck: false,
	test: false,
	skipSourceOutput: true,
	scriptModule: false,
	esModule: true,
})

// post build steps
Deno.copyFileSync("LICENSE", "./build/LICENSE")
Deno.copyFileSync("README.md", "./build/README.md")
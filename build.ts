import packageBuildJson from "./package.build.json" assert { type: "json" }
import { build, emptyDir } from "jsr:@deno/dnt@^0.41.3"

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
})

// post build steps
Deno.copyFileSync("LICENSE", "./lib/LICENSE")
Deno.copyFileSync("README.md", "./lib/README.md")
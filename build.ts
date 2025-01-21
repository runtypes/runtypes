/* eslint-disable import/no-unused-modules */
import packageBuildJson from "./package.build.json" with { type: "json" }
import { assertExists } from "@std/assert"
import { build, emptyDir, type EntryPoint } from "jsr:@deno/dnt@0.41.3"
import { walk } from "jsr:@std/fs@1.0.8"
import { join, relative } from "jsr:@std/path@1.0.8"

await emptyDir("./build")

assertExists(import.meta.dirname)
const dirname = import.meta.dirname

const entryPoints = (
	await Array.fromAsync(walk(join(dirname, "src"), { match: [/.+(?<!\.test)\.ts$/] }))
)
	.filter(entry => entry.isFile)
	.map(
		(entry): EntryPoint => ({
			name: "./" + relative(join(dirname, "src"), entry.path).replace(/\.ts$/, ""),
			path: relative(dirname, entry.path),
		}),
	)
	.filter(entry => !entry.name.startsWith("./utils-internal"))

await build({
	entryPoints: ["src/index.ts", ...entryPoints],
	outDir: "./build",
	shims: {},
	package: packageBuildJson,
	packageManager: "pnpm",
	typeCheck: false,
	test: false,
	skipSourceOutput: true,
	esModule: true,
})

Deno.copyFileSync("LICENSE", "./build/LICENSE")
Deno.copyFileSync("README.md", "./build/README.md")

const packageJson = JSON.parse(await Deno.readTextFile("build/package.json"))
delete packageJson["_generatedBy"]
await Deno.writeTextFile("build/package.json", JSON.stringify(packageJson, null, "\t"))

// <https://github.com/denoland/dnt/issues/444>
const objectCjs = await Deno.readTextFile("build/script/Object.js")
await Deno.writeTextFile(
	"build/script/Object.js",
	objectCjs.replace(/^Object\.defineProperty/m, "globalThis.Object.defineProperty"),
)

// Generate `jsr.json`
const jsrJson = {
	name: "@runtypes/runtypes",
	version: packageBuildJson.version,
	license: packageBuildJson.license,
	exports: Object.fromEntries(
		entryPoints.map(entry => [entry.name === "./index" ? "." : entry.name, "./" + entry.path]),
	),
	publish: {
		include: ["LICENSE", "README.md", "src/**/*.ts"],
		exclude: ["src/**/*.test.ts"],
	},
}
await Deno.writeTextFile("jsr.json", JSON.stringify(jsrJson, null, "\t"))
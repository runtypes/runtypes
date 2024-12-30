import { check, checked } from "./decorators.ts"
import String from "../String.ts"
import { assert, assertEquals, assertThrows } from "@std/assert"

Deno.test("Decorators", async t => {
	await t.step("@checked", async t => {
		await t.step("parameter length", async t => {
			await t.step("works", async t => {
				{
					class Class {
						@checked(String)
						static method(s: string) {
							return s
						}
					}
				}
				assertThrows(() => {
					class Class {
						@checked(String, String)
						static method(s: string) {
							return s
						}
					}
				})
				assertThrows(() => {
					class Class {
						@checked()
						static method(s: string) {
							return s
						}
					}
				})
				{
					class Class {
						@checked(String, String)
						static method(s: string, t: string) {
							return { s, t }
						}
					}
				}
			})
		})
		await t.step("parameter check", async t => {
			await t.step("works", async t => {
				class Class {
					@checked(String)
					static method1(s: string) {
						return s
					}
					@checked(String.withConstraint(s => /^world$/.test(s)))
					static method2(s: string) {
						return s
					}
				}
				Class.method1("hello")
				assertThrows(() => {
					Class.method2("hello")
				}, "Failed constraint check")
				Class.method2("world")
			})
		})
	})
	await t.step("@check", async t => {
		await t.step("parameter length", async t => {
			await t.step("works", async t => {
				{
					class Class {
						@checked(String)
						static method(@check s: string) {
							return s
						}
					}
				}
				assertThrows(() => {
					class Class {
						@checked(String, String)
						static method(@check s: string, t: string) {
							return { s, t }
						}
					}
				})
				{
					class Class {
						@checked(String)
						static method(@check s: string, t: string) {
							return { s, t }
						}
					}
				}
			})
		})
		await t.step("parameter check", async t => {
			await t.step("works", async t => {
				class Class {
					@checked(String)
					static method1(@check s: string) {
						return s
					}
					@checked(String.withConstraint(s => /^world$/.test(s)))
					static method2(s: string, @check t: string) {
						return { s, t }
					}
				}
				Class.method1("hello")
				assertThrows(() => {
					Class.method2("world", "hello")
				}, "Failed constraint check")
				Class.method2("hello", "world")
			})
		})
	})
	await t.step("return value", async t => {
		await t.step("works", async t => {
			class Class {
				@checked(String)
				static method1(s: string) {
					return s
				}
				@checked(String.withConstraint(s => /^world$/.test(s)))
				static method2(s: string, @check t: string) {
					return { s, t }
				}
			}
			assert(Class.method1("hello") === "hello")
			assertEquals(Class.method2("hello", "world"), { s: "hello", t: "world" })
		})
	})
})
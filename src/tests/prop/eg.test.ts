import { expect, it } from "@effect/vitest";
import { Context, Effect, FastCheck, Layer, Schema } from "effect";

// it.effect.prop(
// 	"day #1: should properly sort letters",
// 	[
// 		Schema.Number.pipe(Schema.int()),
// 		Schema.Literal("+"),
// 		Schema.Number.pipe(Schema.int()),
// 	],
// 	async ([left, operator, right]) =>
// 		Effect.gen(function* () {
// 			yield* Effect.succeed(4);
// 			return `${left} ${operator} ${right}`;
// 		}),
// 	{ fastCheck: { numrun: 200 } },
// );

const realNumber = Schema.Finite.pipe(Schema.nonNaN());

it.effect.prop("symmetry", [realNumber, FastCheck.integer()], ([a, b]) =>
	Effect.gen(function* () {
		yield* Effect.void;

		return a + b === b + a;
	}),
);

class Foo extends Context.Tag("Foo")<Foo, "foo">() {
	static Live = Layer.succeed(Foo, "foo");
}

it.effect.prop(
	"adds context",
	[realNumber],
	([num]) =>
		Effect.gen(function* () {
			const foo = yield* Foo;
			expect(foo).toEqual("foo");
			return num === num;
		}),
	{ fastCheck: { numRuns: 200 } },
);

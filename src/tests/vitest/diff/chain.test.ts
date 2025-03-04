import { defaultLayer } from "@/layers/default";
import { IntegerObj } from "@/schemas/objs/int";
import { Evaluator } from "@/services/evaluator";

import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { logDebug } from "effect/Effect";

const tests: [string, number][] = [
	// ["diff(fn(x) { x ** 2 })(3)", 6],
	// ["let f = fn(x) { x ** 2 };  diff(f)(3)", 6],
	// ["let f = fn(x) { (3 * x ** 2 + 5) ** 4 };  diff(f)(3)", 2359296],
	[
		"let f = fn(y) { y ** 4 }; let g = fn(r) { 3 * r ** 2 + 5 }; let h = fn(x) { f(g(x)) };  diff(h)(3)",
		2359296,
	],
	[
		"let f = fn(x) { x ** 4 }; let g = fn(x) { 3 * x ** 2 + 5 }; let h = fn(x) { f(g(x)) };  diff(h)(3)",
		2359296,
	],
];

describe("chain diff", () => {
	for (const [input, expected] of tests) {
		it.effect(input, () =>
			Effect.gen(function* () {
				// eval
				const evaluator = yield* Evaluator;
				const evaluated = yield* evaluator.run(input);
				const { value } = yield* Schema.decodeUnknown(IntegerObj)(evaluated);
				yield* Effect.log("value", value);
				expect(value).toBe(expected); // Assert that the result is 2
			}).pipe(Effect.provide(defaultLayer)),
		);
	}
});

// Effect.runPromise(
// 	Effect.gen(function* () {
// 		// eval
// 		const evaluator = yield* Evaluator;
// 		const evaluated = yield* evaluator.run(
// 			"let f = fn(y) { y ** 4 }; let g = fn(r) { 3 * r ** 2 + 5 }; let h = fn(x) { f(g(x)) };  diff(h)(3)",
// 		);
// 		const { value } = yield* Schema.decodeUnknown(IntegerObj)(evaluated);
// 		yield* logDebug("value", value);
// 		// expect(value).toBe(expected); // Assert that the result is 2
// 	}).pipe(Effect.provide(defaultLayer)),
// );

// Effect.gen(function* () {
// 	// eval
// 	const evaluator = yield* Evaluator;
// 	const evaluated = yield* evaluator.run(input);
// 	const { value } = yield* Schema.decodeUnknown(IntegerObj)(evaluated);
// 	yield* logDebug("value", value);
// 	expect(value).toBe(expected); // Assert that the result is 2
// }).pipe(Effect.provide(defaultLayer));

// it.effect("", () =>
// 	Effect.gen(function* () {
// 		// eval
// 		const evaluator = yield* Evaluator;
// 		const evaluated = yield* evaluator.run("diff(fn(x) {sin(x)})(0)");
// 		const { value } = yield* Schema.decodeUnknown(IntegerObj)(evaluated);
// 		expect(value).toBe(Math.cos(0)); // Assert that the result is 2
// 	}).pipe(Effect.provide(defaultLayer)),
// );

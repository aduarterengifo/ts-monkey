import { defaultLayer } from "@/layers/default";
import { IntegerObj } from "@/schemas/objs/int";
import { Evaluator } from "@/services/evaluator";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";

const tests: [string, number][] = [
	["diff(fn(x) {ln(x)})(1)", 1 / 1],
	["diff(fn(x) {exp(x)})(1)", Math.E],
];

describe("log/exp diff", () => {
	for (const [input, expected] of tests) {
		it.effect(input, () =>
			Effect.gen(function* () {
				// eval
				const evaluator = yield* Evaluator;
				const evaluated = yield* evaluator.run(input);
				const { value } = yield* Schema.decodeUnknown(IntegerObj)(evaluated);
				expect(value).toBe(expected); // Assert that the result is 2
			}).pipe(Effect.provide(defaultLayer)),
		);
	}
});

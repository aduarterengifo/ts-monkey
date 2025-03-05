import { defaultLayer } from "@/layers/default";
import { IntegerObj } from "@/schemas/objs/int";
import { Evaluator } from "@/services/evaluator";
import { secSquared } from "@/services/math";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";

const tests: [string, number][] = [
	["diff(fn(x) {sin(x)})(0)", Math.cos(0)],
	["diff(fn(x) {sin(x)})(pi() / 2)", Math.cos(Math.PI / 2)],
	["diff(fn(x) {cos(x)})(0)", -Math.sin(0)],
	["diff(fn(x) {cos(x)})(pi() / 2)", -Math.sin(Math.PI / 2)],
	["diff(fn(x) {tan(x)})(0)", secSquared(0)],
	["diff(fn(x) {tan(x)})(pi() / 4)", secSquared(Math.PI / 4)],
];

describe("trig diff", () => {
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

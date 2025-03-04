import { defaultLayer } from "@/layers/default";
import { IntegerObj } from "@/schemas/objs/int";
import { Evaluator } from "@/services/evaluator";

import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { logDebug } from "effect/Effect";

const tests: [string, number][] = [["let x = 4; let y = x; let x = 6; y;", 4]];

describe("question: numbers are pass by value", () => {
	for (const [input, expected] of tests) {
		it.effect(input, () =>
			Effect.gen(function* () {
				// eval
				const evaluator = yield* Evaluator;
				const evaluated = yield* evaluator.run(input);
				const { value } = yield* Schema.decodeUnknown(IntegerObj)(evaluated);
				yield* logDebug("value", value);
				expect(value).toBe(expected); // Assert that the result is 2
			}).pipe(Effect.provide(defaultLayer)),
		);
	}
});

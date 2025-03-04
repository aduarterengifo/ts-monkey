import { defaultLayer } from "@/layers/default";
import { IntegerObj } from "@/schemas/objs/int";
import { Evaluator } from "@/services/evaluator";
import { Effect, Schema } from "effect";

Effect.runPromise(
	Effect.gen(function* () {
		// eval
		const evaluator = yield* Evaluator;
		const evaluated = yield* evaluator.run(
			// "let f = fn(y) { y ** 4 }; let g = fn(r) { 3 * r ** 2 + 5 }; let h = fn(x) { f(g(x)) };  diff(h)(3)",
			"let f = fn(x) { x ** 4 }; let g = fn(x) { 3 * x ** 2 + 5 }; let h = fn(x) { f(g(x)) };  diff(h)(3)",
		);
		const { value } = yield* Schema.decodeUnknown(IntegerObj)(evaluated);
		yield* Effect.logDebug("value", value);
		// expect(value).toBe(expected); // Assert that the result is 2
	}).pipe(Effect.provide(defaultLayer)),
);

import { defaultLayer } from "@/layers/default";
import { Evaluator } from "@/services/evaluator";
import { Effect } from "effect";

export const evalP = (input: string) =>
	Effect.gen(function* () {
		const evaluator = yield* Evaluator;
		return yield* evaluator.run(input);
	}).pipe(Effect.provide(defaultLayer));

import { ErrorObj } from "@/schemas/objs/error";
import { Effect } from "effect";
import { runPromiseInDefault } from "../runtimes/default";
import { Evaluator } from "../services/evaluator";

const runAndInterpretProgram = (input: string) =>
	Effect.gen(function* () {
		const evaluator = yield* Evaluator;
		return yield* evaluator.runAndInterpret(input);
	});

export const runAndInterpret = (input: string) =>
	runPromiseInDefault(
		runAndInterpretProgram(input).pipe(
			Effect.catchAll((error) => {
				return Effect.succeed(ErrorObj.make({ message: error.message }));
			}),
		),
	);

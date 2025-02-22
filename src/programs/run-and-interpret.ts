import { Effect } from 'effect'
import { runPromiseInDefault } from '../runtimes/default'
import { Evaluator } from '../services/evaluator'
import { errorObjSchema } from '@/schemas/objs/error'

const runAndInterpretProgram = (input: string) =>
	Effect.gen(function* () {
		const evaluator = yield* Evaluator
		return yield* evaluator.runAndInterpret(input)
	})

export const runAndInterpret = (input: string) =>
	runPromiseInDefault(runAndInterpretProgram(input).pipe(
						Effect.catchAll((error) => {
							return Effect.succeed(errorObjSchema.make({message: error.message}))
						})))

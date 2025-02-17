import { Effect } from 'effect'
import { runPromiseInDefault } from '../runtimes/default'
import { Lexer } from '../services/lexer'

const nextTokenProgram = Effect.gen(function* () {
	const lexer = yield* Lexer
	return yield* lexer.nextToken
})

export const nextToken = () => runPromiseInDefault(nextTokenProgram)

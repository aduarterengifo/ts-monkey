import { Effect } from 'effect'
import { runPromiseInDefault } from '../runtimes/default'
import { Lexer } from '../services/lexer'

const initLexerProgram = (input: string) =>
	Effect.gen(function* () {
		const lexer = yield* Lexer
		yield* lexer.init(input)
	})

export const initLexer = (input: string) =>
	runPromiseInDefault(initLexerProgram(input))

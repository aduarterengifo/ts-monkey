import { Effect } from 'effect'
import { runPromiseInDefault } from '../runtimes/default'
import { LexerStateService } from '../services/lexer/state'

const lexerStateProgram = Effect.gen(function* () {
	const lexerState = yield* LexerStateService
	return yield* lexerState.getAll
})

export const getLexerState = () => runPromiseInDefault(lexerStateProgram)

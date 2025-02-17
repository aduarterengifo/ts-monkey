import { type Effect, ManagedRuntime } from 'effect'
import type { Lexer } from '../services/lexer'
import { defaultLayer } from '../layers/default'
import type { LexerStateService } from '../services/lexer/state'
import type { Evaluator } from '../services/evaluator'

export const runtimeDefault = ManagedRuntime.make(defaultLayer)

export const runPromiseInDefault = <T>(
	eff: Effect.Effect<T, unknown, Lexer | LexerStateService | Evaluator>,
) => runtimeDefault.runPromise(eff)

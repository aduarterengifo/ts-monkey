import { Layer } from 'effect'

import { ManagedRuntime } from 'effect'

import { Logger, LogLevel } from 'effect'

import { test, describe, expect } from 'bun:test'
import { Effect } from 'effect'
import { Lexer } from 'src/services/lexer'

describe('effect', () => {
	test.todo('error behavior', () => {
		const program = Effect.gen(function* () {
			yield* Effect.fail('explode')
			return 'potato'
		}).pipe(
			Logger.withMinimumLogLevel(LogLevel.Debug),
			Effect.withSpan('myspan'),
		)

		ManagedRuntime.make(Layer.mergeAll(Lexer.Default))
			.runPromise(program)
			.then(console.log)
		expect(true).toBe(true)
	})
})

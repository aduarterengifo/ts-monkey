import { Effect, Match } from 'effect'
import { isReturnStatement, type Statement } from '../../../src/services/ast'
import { ParseError } from '../../../src/errors/kenneth/parse'

export const testReturnStatement = (statement: Statement, name: string) =>
	Effect.gen(function* () {
		return yield* Match.value(statement).pipe(
			Match.when(
				(statement) => statement.tokenLiteral() !== 'return',
				function* () {
					return yield* new ParseError({
						message: `expected statement.tokenLiteral() to be return instead got ${statement.tokenLiteral()}`,
					})
				},
			),
			Match.when(
				(statement) => !isReturnStatement(statement),
				function* () {
					return yield* new ParseError({
						message: 'expected statement to be return statement',
					})
				},
			),
			Match.orElse(function* () {
				return yield* Effect.succeed(true)
			}),
		)
	})

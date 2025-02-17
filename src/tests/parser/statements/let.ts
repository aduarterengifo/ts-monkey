import { Effect, Match } from 'effect'
import { KennethParseError } from 'src/errors/kenneth/parse'
import type { LetStmt } from 'src/schemas/nodes/stmts/let'
import type { Stmt } from 'src/schemas/nodes/stmts/union'
import { isLetStatement } from 'src/services/ast'

export const testLetStatement = (statement: Stmt, name: string) =>
	Effect.gen(function* () {
		return yield* Match.value(statement).pipe(
			Match.when(
				(statement) => statement.tokenLiteral() !== 'let',
				function* () {
					return yield* new KennethParseError({
						message: `expected statement.tokenLiteral() to be let instead got ${statement.tokenLiteral()}`,
					})
				},
			),
			Match.when(
				(statement) => isLetStatement(statement),
				function* () {
					const letStmt = statement as LetStmt
					return yield* Match.value(letStmt).pipe(
						Match.when(
							{
								name: {
									value: (value) => value !== name,
								},
							},
							function* () {
								return yield* new KennethParseError({
									message: `expected statement.name.value to be ${name} instead got ${letStmt.name.value}`,
								})
							},
						),
						Match.when(
							(letStmt) => letStmt.name.tokenLiteral() !== name,
							function* () {
								return yield* new KennethParseError({
									message: `expected letStmt.name.tokenLiteral() to be name instead got ${letStmt.name.tokenLiteral()}`,
								})
							},
						),
						Match.orElse(function* () {
							return yield* Effect.succeed(true)
						}),
					)
				},
			),
			Match.orElse(function* () {
				return yield* new KennethParseError({
					message: 'expected statement to be a let statement',
				})
			}),
		)
	})

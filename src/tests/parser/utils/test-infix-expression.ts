import { Effect, Schema } from 'effect'
import { testLiteralExpression } from './test-literal-expression'
import { KennethParseError } from 'src/errors/kenneth/parse'
import type { Exp } from 'src/schemas/nodes/exps/union'
import { InfixExp } from 'src/schemas/nodes/exps/infix'

export const testInfixExpression = (
	exp: Exp,
	left: string | number | boolean,
	operator: string,
	right: string | number | boolean,
) =>
	Effect.gen(function* () {
		const infixExp = yield* Schema.decodeUnknown(InfixExp)(exp)

		yield* testLiteralExpression(infixExp.left, left)

		if (infixExp.operator !== operator) {
			return yield* new KennethParseError({
				message: `Expected exp.operator to be ${operator}, got ${infixExp.operator} instead.`,
			})
		}
		yield* testLiteralExpression(infixExp.right, right)

		return true
	})

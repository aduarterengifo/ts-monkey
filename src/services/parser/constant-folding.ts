import { Effect, Either, Match, Schema } from 'effect'
import { decodeUnknownEither } from 'effect/ParseResult'
import { IntExp } from '../../schemas/nodes/exps/int'
import { nativeToExp, type Exp } from '../../schemas/nodes/exps/union'
import { BlockStmt } from '../../schemas/nodes/stmts/block'
import { ExpStmt } from '../../schemas/nodes/stmts/exp'
import { LetStmt } from '../../schemas/nodes/stmts/let'
import { ReturnStmt } from '../../schemas/nodes/stmts/return'
import type { Stmt } from '../../schemas/nodes/stmts/union'
import {
	OPERATOR_TO_FUNCTION_MAP,
	STRING_OPERATOR_TO_FUNCTION_MAP,
} from '../evaluator/constants'
import { InfixExp } from '../../schemas/nodes/exps/infix'
import { StrExp } from '../../schemas/nodes/exps/str'
import { TokenType } from '../../schemas/token-types/union'

export const constantFoldingOverStmt = (
	stmt: Stmt,
): Effect.Effect<Stmt, never, never> =>
	Match.value(stmt).pipe(
		Match.tag('BlockStmt', ({ token, statements }) =>
			Effect.gen(function* () {
				return new BlockStmt({
					token,
					statements: yield* Effect.all(
						statements.map(constantFoldingOverStmt),
					),
				})
			}),
		),
		Match.tag('ExpStmt', ({ token, expression }) =>
			Effect.gen(function* () {
				return new ExpStmt({
					token,
					expression: yield* constantFoldingOverExp(expression),
				})
			}),
		),
		Match.tag('ReturnStmt', ({ token, value }) =>
			Effect.gen(function* () {
				return new ReturnStmt({
					token,
					value: yield* constantFoldingOverExp(value),
				})
			}),
		),
		Match.tag('LetStmt', ({ token, name, value }) =>
			Effect.gen(function* () {
				return new LetStmt({
					token,
					name,
					value: yield* constantFoldingOverExp(value),
				})
			}),
		),
		Match.exhaustive,
	)

const constantFoldingOverExp = (exp: Exp): Effect.Effect<Exp, never, never> =>
	Match.value(exp).pipe(
		Match.tag('InfixExp', ({ token, left, operator, right }) =>
			Effect.gen(function* () {
				const foldedLeft = yield* constantFoldingOverExp(left)
				const foldedRight = yield* constantFoldingOverExp(right)

				const intResult = Schema.decodeUnknownEither(
					Schema.Struct({ left: IntExp, right: IntExp }),
				)({
					left: foldedLeft,
					right: foldedRight,
				})

				if (Either.isRight(intResult)) {
					return nativeToExp(
						OPERATOR_TO_FUNCTION_MAP[operator](
							intResult.right.left.value,
							intResult.right.right.value,
						),
					)
				}

				const strResult = decodeUnknownEither(
					Schema.Struct({
						left: StrExp,
						operator: Schema.Literal(TokenType.PLUS),
						right: StrExp,
					}),
				)({ left: foldedLeft, operator, right: foldedRight })

				if (Either.isRight(strResult)) {
					return nativeToExp(
						STRING_OPERATOR_TO_FUNCTION_MAP[strResult.right.operator](
							strResult.right.left.value,
							strResult.right.right.value,
						),
					)
				}
				return new InfixExp({
					token,
					left: foldedLeft,
					operator,
					right: foldedRight,
				})
			}),
		),
		Match.orElse(() => Effect.succeed(exp)),
	)

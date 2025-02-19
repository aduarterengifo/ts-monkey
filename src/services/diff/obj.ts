import { Effect, Match, Schema } from 'effect'
import {
	createIntegerObj,
	createInfixObj,
	createIdentObj,
} from '../object'
import { expectIdentEquivalence, IdentExp } from '../../schemas/nodes/exps/ident'
import { TokenType } from '../../schemas/token-types/union'
import type { ParseError } from 'effect/ParseResult'
import { KennethParseError } from '../../errors/kenneth/parse'
import { PolynomialObj, polynomialObjSchema } from '@/schemas/objs/unions/polynomial'
import { polynomialOperatorSchema } from '@/schemas/polynomial-operator'
import { IdentObj, identObjSchema } from '@/schemas/objs/ident'
import { IntObj, intObjSchema } from '@/schemas/objs/int'

export const newTerm = (coeff: number, x: IdentObj, power: number) =>
	createInfixObj(
		createIntegerObj(coeff),
		'*',
		createInfixObj(x, '**', createIntegerObj(power)),
	)

const processTerm = (exp: PolynomialObj, x: IdentExp) =>
	Match.value(exp).pipe(
		Match.tag('IntegerObj', () => Effect.succeed(createIntegerObj(0))),
		Match.tag('IdentObj', () => Effect.succeed(createIntegerObj(1))),
		Match.tag('InfixObj', ({ left, operator, right }) =>
			Effect.gen(function* () {
				const op = yield* Schema.decodeUnknown(
					Schema.Literal(TokenType.ASTERISK, TokenType.EXPONENT),
				)(operator)
				return yield* Match.value(op).pipe(
					Match.when(TokenType.ASTERISK, () =>
						Effect.gen(function* () {
							const coeff = yield* Schema.decodeUnknown(intObjSchema)(left)

							return yield* Match.value(right).pipe(
								Match.tag('IdentObj', (identExp) =>
									Effect.gen(function* () {
										return yield* Effect.succeed(coeff)
									}),
								),
								Match.tag(
									'InfixObj',
									({
										left: secondLeft,
										operator: secondOperator,
										right: secondRight,
									}) =>
										Effect.gen(function* () {
											yield* Schema.decodeUnknown(Schema.Literal('**'))(
												secondOperator,
											)
											
											const power = yield* Schema.decodeUnknown(intObjSchema)(secondRight)

											return newTerm(
												coeff.value * power.value,
												createIdentObj(x),
												power.value - 1,
											)
										}),
								),
								Match.orElse(() =>
									Effect.fail(new KennethParseError({ message: 'failed' })),
								),
							)
						}),
					),
					Match.when(TokenType.EXPONENT, () =>
						Effect.gen(function* () {
							const {identExp} = yield* Schema.decodeUnknown(identObjSchema)(left) 

							yield* expectIdentEquivalence(identExp, x)

							const { value } = right as IntObj

							return yield* Effect.succeed(
								newTerm(value, createIdentObj(x), value - 1),
							)
						}),
					),
					Match.exhaustive,
				)
			}),
		),
		Match.exhaustive,
	)

export const diffPolynomial = (
	obj: PolynomialObj,
	x: IdentExp,
): Effect.Effect<PolynomialObj, ParseError | KennethParseError, never> =>
	Match.value(obj).pipe(
		Match.tag('IntegerObj', () => processTerm(obj, x)), // leaf
		Match.tag('IdentObj', () => processTerm(obj, x)), // leaf
		Match.tag('InfixObj', (infixObj) =>
			Effect.gen(function* () {
				const left = yield* Schema.decodeUnknown(polynomialObjSchema)(infixObj.left)

				const right = yield* Schema.decodeUnknown(polynomialObjSchema)(infixObj.right)

				const operator = yield* Schema.decodeUnknown(polynomialOperatorSchema)(infixObj.operator)

				return yield* Match.value(operator).pipe(
					Match.when(TokenType.ASTERISK, () =>
						Match.value(obj).pipe(
							Match.tag('InfixObj', () =>
								Effect.gen(function* () {
									if (
										(left._tag === 'InfixObj' && left.operator === TokenType.PLUS) ||
										(right._tag === 'InfixObj' && right.operator === TokenType.PLUS)
									) {
										return createInfixObj(
											createInfixObj(
												yield* diffPolynomial(left, x),
												TokenType.ASTERISK,
												right,
											),
											TokenType.PLUS,
											createInfixObj(
												left,
												TokenType.ASTERISK,
												yield* diffPolynomial(right, x),
											),
										)
									}
									return yield* processTerm(obj, x) // leaf
								}),
							),
							Match.orElse(() => processTerm(obj, x)), // leaf
						),
					),
					Match.when(TokenType.SLASH, () =>
						Match.value(obj).pipe(
							Match.tag('InfixObj', () =>
								Effect.gen(function* () {
									if (
										(left._tag === 'InfixObj' && left.operator === TokenType.PLUS) ||
										(right._tag === 'InfixObj' && right.operator === TokenType.PLUS)
									) {
										return createInfixObj(
											createInfixObj(
												createInfixObj(
													yield* diffPolynomial(left, x),
													TokenType.ASTERISK,
													right,
												),
												TokenType.MINUS,
												createInfixObj(
													left,
													TokenType.ASTERISK,
													yield* diffPolynomial(right, x),
												),
											),
											TokenType.SLASH,
											createInfixObj(right, TokenType.EXPONENT, createIntegerObj(2)),
										)
									}
									return yield* processTerm(obj, x) // leaf
								}),
							),
							Match.orElse(() => processTerm(obj, x)), // leaf
						),
					),
					Match.when(TokenType.EXPONENT, () => processTerm(obj, x)),
					Match.when(TokenType.PLUS, () =>
						Effect.gen(function* () {
							return yield* Effect.succeed(
								createInfixObj(
									yield* diffPolynomial(left, x),
									TokenType.PLUS,
									yield* diffPolynomial(right, x),
								),
							)
						}),
					),
					Match.when(TokenType.MINUS, () =>
						Effect.gen(function* () {
							return yield* Effect.succeed(
								createInfixObj(
									yield* diffPolynomial(left, x),
									TokenType.PLUS,
									yield* diffPolynomial(right, x),
								),
							)
						}),
					),
					Match.exhaustive,
				)
			}),
		),
		Match.exhaustive,
	)

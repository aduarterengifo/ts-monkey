import { IntegerObj } from "@/schemas/objs/int";
import {
	type PolynomialObj,
	powerRule,
	productRule,
	quotientRule,
	sumAndDifferenceRule,
} from "@/schemas/objs/unions/polynomials";
import { Effect, Match, Schema } from "effect";
import type { ParseError } from "effect/ParseResult";
import { KennethParseError } from "../../errors/kenneth/parse";
import type { IdentExp } from "../../schemas/nodes/exps/ident";
import { TokenType } from "../../schemas/token-types/union";

const processTerm = (exp: PolynomialObj, x: IdentExp) =>
	Match.value(exp).pipe(
		Match.tag("IntegerObj", () =>
			Effect.succeed(IntegerObj.make({ value: 0 })),
		),
		Match.tag("IdentObj", () => Effect.succeed(IntegerObj.make({ value: 1 }))),
		Match.tag("InfixObj", ({ left, operator, right }) =>
			Effect.gen(function* () {
				const op = yield* Schema.decodeUnknown(
					Schema.Literal(TokenType.ASTERISK, TokenType.EXPONENT),
				)(operator);
				return yield* Match.value(op).pipe(
					Match.when(TokenType.ASTERISK, () =>
						Effect.gen(function* () {
							const coeff = left as IntegerObj;

							return yield* Match.value(right).pipe(
								Match.tag("IdentObj", (identExp) =>
									Effect.gen(function* () {
										return yield* Effect.succeed(coeff);
									}),
								),
								Match.tag(
									"InfixObj",
									({
										left: secondLeft,
										operator: secondOperator,
										right: secondRight,
									}) =>
										Effect.gen(function* () {
											yield* Schema.decodeUnknown(
												Schema.Literal(TokenType.EXPONENT),
											)(secondOperator);
											//const secondLeftParsed = secondLeft as IdentObj
											// const secondLeftParsed =
											// yield* expectIdentEquivalence(secondLeftParsed, x)

											const power =
												yield* Schema.decodeUnknown(IntegerObj)(secondRight);

											return powerRule(coeff, power, x);
										}),
								),
								Match.orElse(() =>
									Effect.fail(new KennethParseError({ message: "failed" })),
								),
							);
						}),
					),
					Match.when(TokenType.EXPONENT, () =>
						Effect.gen(function* () {
							//const identExp = left as IdentObj

							// yield* expectIdentEquivalence(identExp, x)

							const integerObj = yield* Schema.decodeUnknown(IntegerObj)(right);

							return powerRule(IntegerObj.make({ value: 1 }), integerObj, x);
						}),
					),
					Match.exhaustive,
				);
			}),
		),
		Match.exhaustive,
	);

export const diffPolynomial = (
	obj: PolynomialObj,
	x: IdentExp,
): Effect.Effect<PolynomialObj, ParseError | KennethParseError, never> =>
	Match.value(obj).pipe(
		Match.tag("IntegerObj", () => processTerm(obj, x)), // leaf
		Match.tag("IdentObj", () => processTerm(obj, x)), // leaf
		Match.tag("InfixObj", (infixObj) =>
			Effect.gen(function* () {
				const left = infixObj.left as PolynomialObj;

				const right = infixObj.right as PolynomialObj;

				const operator = yield* Schema.decodeUnknown(
					Schema.Literal(
						TokenType.MINUS,
						TokenType.PLUS,
						TokenType.ASTERISK,
						TokenType.SLASH,
						TokenType.EXPONENT,
					),
				)(infixObj.operator);

				return yield* Match.value(operator).pipe(
					Match.when(TokenType.ASTERISK, () =>
						Match.value(obj).pipe(
							Match.tag("InfixObj", () =>
								Effect.gen(function* () {
									if (
										(left._tag === "InfixObj" &&
											left.operator === TokenType.PLUS) ||
										(right._tag === "InfixObj" &&
											right.operator === TokenType.PLUS)
									) {
										return yield* productRule(left, right, x);
									}
									return yield* processTerm(obj, x); // leaf
								}),
							),
							Match.orElse(() => processTerm(obj, x)), // leaf
						),
					),
					Match.when(TokenType.SLASH, () =>
						Match.value(obj).pipe(
							Match.tag("InfixObj", () =>
								Effect.gen(function* () {
									if (
										(left._tag === "InfixObj" &&
											left.operator === TokenType.PLUS) ||
										(right._tag === "InfixObj" &&
											right.operator === TokenType.PLUS)
									) {
										return yield* quotientRule(left, right, x);
									}
									return yield* processTerm(obj, x); // leaf
								}),
							),
							Match.orElse(() => processTerm(obj, x)), // leaf
						),
					),
					Match.when(TokenType.EXPONENT, () => processTerm(obj, x)),
					Match.when(TokenType.PLUS, (plus) =>
						sumAndDifferenceRule(left, right, x, plus),
					),
					Match.when(TokenType.MINUS, (minus) =>
						sumAndDifferenceRule(left, right, x, minus),
					),
					Match.exhaustive,
				);
			}),
		),
		Match.exhaustive,
	);

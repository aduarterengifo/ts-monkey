import { IdentObj } from "@/schemas/objs/ident";
import { InfixObj } from "@/schemas/objs/infix";
import { IntegerObj, ONE } from "@/schemas/objs/int";
import {
	PolynomialObj,
	chainRule,
	constantRule,
	powerRule,
	productRule,
	quotientRule,
	sumAndDifferenceRule,
} from "@/schemas/objs/unions/polynomials";
import { Effect, Match, Schema } from "effect";
import type { ParseError } from "effect/ParseResult";
import { KennethParseError } from "../../errors/kenneth/parse";
import {
	type IdentExp,
	expectIdentEquivalence,
} from "../../schemas/nodes/exps/ident";
import { TokenType } from "../../schemas/token-types/union";

const processTerm = (exp: PolynomialObj, x: IdentExp) =>
	Match.value(exp).pipe(
		Match.tag("IntegerObj", () => constantRule()),
		Match.tag("IdentObj", () => Effect.succeed(powerRule(ONE, ONE, x))),
		Match.tag("InfixObj", ({ left, operator, right }) =>
			Schema.decodeUnknown(
				Schema.Literal(TokenType.ASTERISK, TokenType.EXPONENT),
			)(operator).pipe(
				Effect.flatMap((operator) =>
					Match.value(operator).pipe(
						Match.when(TokenType.ASTERISK, () =>
							Schema.decodeUnknown(IntegerObj)(left).pipe(
								Effect.flatMap((coeff) =>
									Match.value(right).pipe(
										Match.tag("IdentObj", () => Effect.succeed(coeff)),
										Match.tag(
											"InfixObj",
											({
												left,
												operator: secondOperator,
												right: secondRight,
											}) =>
												Effect.all([
													Schema.decodeUnknown(
														Schema.Literal(TokenType.EXPONENT),
													)(secondOperator),
													Schema.decodeUnknown(IntegerObj)(secondRight),
												]).pipe(
													Effect.flatMap(([operator, power]) =>
														Effect.succeed(powerRule(coeff, power, x)),
													),
												),
										),
										Match.orElse(() =>
											Effect.fail(new KennethParseError({ message: "failed" })),
										),
									),
								),
							),
						),
						Match.when(TokenType.EXPONENT, () =>
							Schema.decodeUnknown(IdentObj)(left).pipe(
								Effect.flatMap(({ identExp }) =>
									Effect.gen(function* () {
										yield* expectIdentEquivalence(identExp, x);

										const integerObj =
											yield* Schema.decodeUnknown(IntegerObj)(right);

										return powerRule(ONE, integerObj, x);
									}),
								),
							),
						),
						Match.exhaustive,
					),
				),
			),
		),
		Match.exhaustive,
	);

export const diffPolynomial = (
	obj: PolynomialObj,
	x: IdentExp,
): Effect.Effect<PolynomialObj, ParseError | KennethParseError, never> =>
	Match.value(obj).pipe(
		Match.tag("IntegerObj", () => constantRule()), // leaf
		Match.tag("IdentObj", () => Effect.succeed(powerRule(ONE, ONE, x))), // leaf
		Match.tag("InfixObj", ({ left, operator, right }) =>
			Effect.all([
				Schema.decodeUnknown(PolynomialObj)(left),
				Schema.decodeUnknown(
					Schema.Literal(
						TokenType.MINUS,
						TokenType.PLUS,
						TokenType.ASTERISK,
						TokenType.SLASH,
						TokenType.EXPONENT,
					),
				)(operator),
				Schema.decodeUnknown(PolynomialObj)(right),
			]).pipe(
				Effect.flatMap(([left, operator, right]) =>
					Match.value(operator).pipe(
						Match.when(TokenType.ASTERISK, () => productRule(left, right, x)),
						Match.when(TokenType.SLASH, () => quotientRule(left, right, x)),
						Match.when(TokenType.EXPONENT, (operator) =>
							Match.value(left).pipe(
								Match.tag("InfixObj", () =>
									chainRule(
										InfixObj.make({
											left: IdentObj.make({ identExp: x }),
											operator,
											right,
										}),
										left,
										x,
									),
								),
								Match.orElse(() => processTerm(obj, x)),
							),
						),
						Match.when(TokenType.PLUS, (plus) =>
							sumAndDifferenceRule(left, right, x, plus),
						),
						Match.when(TokenType.MINUS, (minus) =>
							sumAndDifferenceRule(left, right, x, minus),
						),
						Match.exhaustive,
					),
				),
			),
		),
		Match.exhaustive,
	);

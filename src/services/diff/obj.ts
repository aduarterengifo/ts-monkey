import { BuiltInDiffFunc } from "@/schemas/built-in/diff";
import { CallExp } from "@/schemas/nodes/exps/call";
import { OpInfixExp } from "@/schemas/nodes/exps/infix";
import { nativeToIntExp } from "@/schemas/nodes/exps/int";
import { PrefixExp, opPrefixExp } from "@/schemas/nodes/exps/prefix";
import { BuiltInObj } from "@/schemas/objs/built-in";
import { BuiltInCallObj, CallObj } from "@/schemas/objs/call";
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
	IdentExp,
	expectIdentEquivalence,
} from "../../schemas/nodes/exps/ident";
import { TokenType } from "../../schemas/token-types/union";
import { makeLambda } from "./helper";

const baseBuiltInDiffFunc =
	(x: IdentExp) =>
	({ fn, args }: CallObj) =>
		Schema.decodeUnknown(BuiltInObj)(fn).pipe(
			Effect.flatMap((fn) =>
				Schema.decodeUnknown(BuiltInDiffFunc)(fn.fn).pipe(
					Effect.flatMap((diffFn) =>
						Match.value(diffFn).pipe(
							Match.when("sin", () =>
								Effect.succeed(
									CallObj.make({
										fn: BuiltInObj.make({ fn: "cos" }),
										args,
									}),
								),
							),
							Match.when("cos", () =>
								makeLambda(
									x,
									args,
									opPrefixExp("-")(
										CallExp.make({
											token: {
												_tag: "(",
												literal: "(",
											},
											fn: IdentExp.make({
												token: {
													_tag: "IDENT",
													literal: "sin",
												},
												value: "sin",
											}),
											args: [x],
										}),
									),
								),
							),
							Match.when("tan", () =>
								makeLambda(
									x,
									args,
									OpInfixExp("/")(nativeToIntExp(1))(
										OpInfixExp("**")(
											CallExp.make({
												token: {
													_tag: "(",
													literal: "(",
												},
												fn: IdentExp.make({
													token: {
														_tag: "IDENT",
														literal: "cos",
													},
													value: "cos",
												}),
												args: [x],
											}),
										)(nativeToIntExp(2)),
									),
								),
							),
							Match.when("ln", () =>
								makeLambda(x, args, OpInfixExp("/")(nativeToIntExp(1))(x)),
							),
							Match.when("exp", () =>
								Effect.succeed(BuiltInCallObj("exp")(args)),
							),
							Match.exhaustive,
						),
					),
				),
			),
		);

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
		Match.tag("CallObj", baseBuiltInDiffFunc(x)),
		Match.exhaustive,
	);

export const diffPolynomial = (
	obj: PolynomialObj,
	x: IdentExp,
): Effect.Effect<PolynomialObj, ParseError | KennethParseError, never> =>
	Match.value(obj).pipe(
		Match.tag("IntegerObj", () => constantRule()), // leaf
		Match.tag("CallObj", baseBuiltInDiffFunc(x)),
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

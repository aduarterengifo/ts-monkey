import { FunctionObj } from "@/schemas/objs/function";
import { IntegerObj } from "@/schemas/objs/int";
import type { Obj } from "@/schemas/objs/union";
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
import { FuncExp } from "../../schemas/nodes/exps/function";
import { IdentExp } from "../../schemas/nodes/exps/ident";
import { polynomialExpSchema } from "../../schemas/nodes/exps/unions/int-ident-infix";
import { BlockStmt } from "../../schemas/nodes/stmts/block";
import { ExpStmt } from "../../schemas/nodes/stmts/exp";
import { TokenType } from "../../schemas/token-types/union";
import type { Environment } from "../object/environment";

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

export const diff = (...args: Obj[]) =>
	Effect.gen(function* () {
		// A single argument of type function with a single ident argument.
		// counter factually I can also accept a fn(fn: (x: number) -> number) | fn(x: number) later is status quo.
		// either way the fact remains that args should be a single function.
		const {
			params,
			body: { token, statements },
			env,
		} = (yield* Schema.decodeUnknown(
			Schema.Tuple(
				Schema.Struct({
					params: Schema.Tuple(Schema.Union(IdentExp, FuncExp)),
					body: BlockStmt,
					env: Schema.Unknown,
				}),
			),
		)(args))[0];

		const { token: expStmtToken, expression } = (yield* Schema.decodeUnknown(
			Schema.Tuple(ExpStmt),
		)(statements))[0];

		const exp = yield* Schema.decodeUnknown(polynomialExpSchema)(expression);

		return yield* Match.value(params[0]).pipe(
			Match.tag("IdentExp", (x) =>
				Effect.gen(function* () {
					return FunctionObj.make({
						params: params as unknown as IdentExp[], // TODO: HACK
						body: BlockStmt.make({
							token,
							statements: [
								ExpStmt.make({
									token: expStmtToken,
									expression: yield* diffPolynomial(exp, x),
								}),
							],
						}),
						env: env as Environment,
					});
				}),
			),
			Match.tag("FuncExp", (g) =>
				Effect.gen(function* () {
					const { parameters: gParams } = g;
					const x = (yield* Schema.decodeUnknown(Schema.Tuple(IdentExp))(
						gParams,
					))[0];
					return FunctionObj.make({
						params: params as unknown as IdentExp[], // TODO: HACK
						body: BlockStmt.make({
							token,
							statements: [
								ExpStmt.make({
									token: expStmtToken,
									expression: yield* diffPolynomial(exp, x),
								}),
							],
						}),
						env: env as Environment,
					});

					// chain rule
				}),
			),
			Match.exhaustive,
		);
	});

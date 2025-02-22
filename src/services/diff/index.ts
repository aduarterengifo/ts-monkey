import { Effect, Match, Schema } from "effect";
import type { ParseError } from "effect/ParseResult";
import type { KennethParseError } from "src/errors/kenneth/parse";
import { FuncExp } from "src/schemas/nodes/exps/function";
import { IdentExp, expectIdentEquivalence } from "src/schemas/nodes/exps/ident";
import { InfixExp, OpInfixExp } from "src/schemas/nodes/exps/infix";
import { IntExp, nativeToIntExp } from "src/schemas/nodes/exps/int";
import { isInfixExp } from "src/schemas/nodes/exps/union";
import {
	type PolynomialExp,
	polynomialExpSchema,
} from "src/schemas/nodes/exps/unions/int-ident-infix";
import { newTerm } from "src/schemas/nodes/exps/unions/term";
import { BlockStmt } from "src/schemas/nodes/stmts/block";
import { ExpStmt } from "src/schemas/nodes/stmts/exp";
import { TokenType } from "src/schemas/token-types/union";
import { type Obj, createFunctionObj } from "../object";
import type { Environment } from "../object/environment";

const processTerm = (exp: IntExp | IdentExp | InfixExp, x: IdentExp) =>
	Match.value(exp).pipe(
		Match.tag("IntExp", () => Effect.succeed(nativeToIntExp(0))),
		Match.tag("IdentExp", () => Effect.succeed(nativeToIntExp(1))),
		Match.tag("InfixExp", ({ left, operator, right }) =>
			Effect.gen(function* () {
				const op = yield* Schema.decodeUnknown(
					Schema.Literal(TokenType.ASTERISK, TokenType.EXPONENT),
				)(operator);
				return yield* Match.value(op).pipe(
					Match.when("*", () =>
						Effect.gen(function* () {
							const coeff = yield* Schema.decodeUnknown(IntExp)(left);

							const rightParsed = yield* Schema.decodeUnknown(
								Schema.Union(IdentExp, InfixExp),
							)(right);

							return yield* Match.value(rightParsed).pipe(
								Match.tag("IdentExp", (identExp) =>
									Effect.gen(function* () {
										yield* expectIdentEquivalence(identExp, x);
										return coeff;
									}),
								),
								Match.tag(
									"InfixExp",
									({
										left: secondLeft,
										operator: secondOperator,
										right: secondRight,
									}) =>
										Effect.gen(function* () {
											yield* Schema.decodeUnknown(Schema.Literal("**"))(
												secondOperator,
											);
											const secondLeftParsed =
												yield* Schema.decodeUnknown(IdentExp)(secondLeft);

											yield* expectIdentEquivalence(secondLeftParsed, x);

											const power =
												yield* Schema.decodeUnknown(IntExp)(secondRight);

											// TODO: FIX STUPID NUMBER VALUE
											return newTerm(
												coeff.value * power.value,
												x,
												power.value - 1,
											);
										}),
								),
								Match.exhaustive,
							);
						}),
					),
					Match.when("**", () =>
						Effect.gen(function* () {
							const identExp = yield* Schema.decodeUnknown(IdentExp)(left);

							yield* expectIdentEquivalence(identExp, x);

							const { value } = yield* Schema.decodeUnknown(IntExp)(right);

							return newTerm(value, x, value - 1);
						}),
					),
					Match.exhaustive,
				);
			}),
		),
		Match.exhaustive,
	);

const diffPolynomial = (
	exp: PolynomialExp,
	x: IdentExp,
): Effect.Effect<
	IdentExp | IntExp | InfixExp,
	ParseError | KennethParseError,
	never
> =>
	Match.value(exp).pipe(
		Match.tag("IntExp", () => processTerm(exp, x)), // leaf
		Match.tag("IdentExp", () => processTerm(exp, x)), // leaf
		Match.tag("InfixExp", (infixExp) =>
			Effect.gen(function* () {
				const left = yield* Schema.decodeUnknown(polynomialExpSchema)(
					infixExp.left,
				);

				const right = yield* Schema.decodeUnknown(polynomialExpSchema)(
					infixExp.right,
				);

				const operator = yield* Schema.decodeUnknown(
					Schema.Literal("+", "*", "/", "**"),
				)(infixExp.operator);

				return yield* Match.value(operator).pipe(
					Match.when("*", () =>
						Match.value(exp).pipe(
							Match.tag("InfixExp", () =>
								Effect.gen(function* () {
									if (
										(isInfixExp(left) && left.operator === "+") ||
										(isInfixExp(right) && right.operator === "+")
									) {
										return OpInfixExp("+")(
											OpInfixExp("*")(yield* diffPolynomial(left, x), right),
											OpInfixExp("*")(left, yield* diffPolynomial(right, x)),
										);
									}
									return yield* processTerm(exp, x); // leaf
								}),
							),
							Match.orElse(() => processTerm(exp, x)), // leaf
						),
					),
					Match.when("/", () =>
						Match.value(exp).pipe(
							Match.tag("InfixExp", () =>
								Effect.gen(function* () {
									if (
										(isInfixExp(left) && left.operator === "+") ||
										(isInfixExp(right) && right.operator === "+")
									) {
										return OpInfixExp("/")(
											OpInfixExp("-")(
												OpInfixExp("*")(yield* diffPolynomial(left, x), right),
												OpInfixExp("*")(left, yield* diffPolynomial(right, x)),
											),
											OpInfixExp("**")(right, nativeToIntExp(2)),
										);
									}
									return yield* processTerm(exp, x); // leaf
								}),
							),
							Match.orElse(() => processTerm(exp, x)), // leaf
						),
					),
					Match.when("**", () => processTerm(exp, x)),
					Match.when("+", () =>
						Effect.gen(function* () {
							return OpInfixExp(TokenType.PLUS)(
								yield* diffPolynomial(left, x),
								yield* diffPolynomial(right, x),
							);
						}),
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
					return createFunctionObj(
						params as unknown as IdentExp[], // TODO: HACK
						BlockStmt.make({
							token,
							statements: [
								ExpStmt.make({
									token: expStmtToken,
									expression: yield* diffPolynomial(exp, x),
								}),
							],
						}),
						env as Environment,
					);
				}),
			),
			Match.tag("FuncExp", (g) =>
				Effect.gen(function* () {
					const { parameters: gParams } = g;
					const x = (yield* Schema.decodeUnknown(Schema.Tuple(IdentExp))(
						gParams,
					))[0];
					return createFunctionObj(
						params as unknown as IdentExp[], // TODO: HACK
						BlockStmt.make({
							token,
							statements: [
								ExpStmt.make({
									token: expStmtToken,
									expression: yield* diffPolynomial(exp, x),
								}),
							],
						}),
						env as Environment,
					);

					// chain rule
				}),
			),
			Match.exhaustive,
		);
	});

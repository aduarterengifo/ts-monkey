import { Effect, Match, Schema } from "effect";
import type { ParseError } from "effect/ParseResult";
import { KennethParseError } from "../../errors/kenneth/parse";
import { FuncExp } from "../../schemas/nodes/exps/function";
import { IdentExp } from "../../schemas/nodes/exps/ident";
import { polynomialExpSchema } from "../../schemas/nodes/exps/unions/int-ident-infix";
import { BlockStmt } from "../../schemas/nodes/stmts/block";
import { ExpStmt } from "../../schemas/nodes/stmts/exp";
import { TokenType } from "../../schemas/token-types/union";
import {
	type IdentObj,
	type InfixObj,
	type IntegerObj,
	type Obj,
	createFunctionObj,
	createIdentObj,
	createInfixObj,
	createIntegerObj,
} from "../object";
import type { Environment } from "../object/environment";

export type PolynomialObj = IntegerObj | IdentObj | InfixObj;

export const newTerm = (coeff: number, x: IdentObj, power: number) =>
	createInfixObj(
		createIntegerObj(coeff),
		"*",
		createInfixObj(x, "**", createIntegerObj(power)),
	);

const processTerm = (exp: PolynomialObj, x: IdentExp) =>
	Match.value(exp).pipe(
		Match.tag("IntegerObj", () => Effect.succeed(createIntegerObj(0))),
		Match.tag("IdentObj", () => Effect.succeed(createIntegerObj(1))),
		Match.tag("InfixObj", ({ left, operator, right }) =>
			Effect.gen(function* () {
				const op = yield* Schema.decodeUnknown(
					Schema.Literal(TokenType.ASTERISK, TokenType.EXPONENT),
				)(operator);
				return yield* Match.value(op).pipe(
					Match.when("*", () =>
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
											yield* Schema.decodeUnknown(Schema.Literal("**"))(
												secondOperator,
											);
											//const secondLeftParsed = secondLeft as IdentObj

											// yield* expectIdentEquivalence(secondLeftParsed, x)

											const power = secondRight as IntegerObj;

											// TODO: FIX STUPID NUMBER VALUE
											return newTerm(
												coeff.value * power.value,
												createIdentObj(x),
												power.value - 1,
											);
										}),
								),
								Match.orElse(() =>
									Effect.fail(new KennethParseError({ message: "failed" })),
								),
							);
						}),
					),
					Match.when("**", () =>
						Effect.gen(function* () {
							//const identExp = left as IdentObj

							// yield* expectIdentEquivalence(identExp, x)

							const { value } = right as IntegerObj;

							return yield* Effect.succeed(
								newTerm(value, createIdentObj(x), value - 1),
							);
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
					Schema.Literal("+", "*", "/", "**"),
				)(infixObj.operator);

				return yield* Match.value(operator).pipe(
					Match.when("*", () =>
						Match.value(obj).pipe(
							Match.tag("InfixObj", () =>
								Effect.gen(function* () {
									if (
										(left._tag === "InfixObj" && left.operator === "+") ||
										(right._tag === "InfixObj" && right.operator === "+")
									) {
										return createInfixObj(
											createInfixObj(
												yield* diffPolynomial(left, x),
												"*",
												right,
											),
											"+",
											createInfixObj(
												left,
												"*",
												yield* diffPolynomial(right, x),
											),
										);
									}
									return yield* processTerm(obj, x); // leaf
								}),
							),
							Match.orElse(() => processTerm(obj, x)), // leaf
						),
					),
					Match.when("/", () =>
						Match.value(obj).pipe(
							Match.tag("InfixObj", () =>
								Effect.gen(function* () {
									if (
										(left._tag === "InfixObj" && left.operator === "+") ||
										(right._tag === "InfixObj" && right.operator === "+")
									) {
										return createInfixObj(
											createInfixObj(
												createInfixObj(
													yield* diffPolynomial(left, x),
													"*",
													right,
												),
												"-",
												createInfixObj(
													left,
													"*",
													yield* diffPolynomial(right, x),
												),
											),
											"/",
											createInfixObj(right, "**", createIntegerObj(2)),
										);
									}
									return yield* processTerm(obj, x); // leaf
								}),
							),
							Match.orElse(() => processTerm(obj, x)), // leaf
						),
					),
					Match.when("**", () => processTerm(obj, x)),
					Match.when("+", () =>
						Effect.gen(function* () {
							return yield* Effect.succeed(
								createInfixObj(
									yield* diffPolynomial(left, x),
									"+",
									yield* diffPolynomial(right, x),
								),
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

import { BuiltInObj } from "@/schemas/objs/built-in";
import { ErrorObj } from "@/schemas/objs/error";
import { FunctionObj } from "@/schemas/objs/function";
import { IntegerObj } from "@/schemas/objs/int";
import type { Obj } from "@/schemas/objs/union";
import { Effect, Match, Schema } from "effect";
import { DiffExp } from "src/schemas/nodes/exps/diff";
import { IdentExp } from "src/schemas/nodes/exps/ident";
import { BlockStmt } from "src/schemas/nodes/stmts/block";
import { ExpStmt } from "src/schemas/nodes/stmts/exp";
import type { Environment } from "./environment";

// Where does this fit.
// it would be here where

const makeUnaryMathFunction =
	(mathFn: (x: number) => number) =>
	(...args: Obj[]) =>
		Schema.decodeUnknown(Schema.Tuple(IntegerObj))(args).pipe(
			Effect.flatMap(([{ value }]) =>
				Effect.succeed(IntegerObj.make({ value: mathFn(value) })),
			),
		);

const sin = makeUnaryMathFunction(Math.sin);
const cos = makeUnaryMathFunction(Math.cos);
const tan = makeUnaryMathFunction(Math.tan);
const ln = makeUnaryMathFunction(Math.log);
const exp = makeUnaryMathFunction(Math.exp);

const pi = (...args: Obj[]) =>
	Effect.succeed(IntegerObj.make({ value: Math.PI })); // to get around not having decimals.
const e = (...args: Obj[]) =>
	Effect.succeed(IntegerObj.make({ value: Math.E })); // to get around not having decimals.

const diff = (...args: Obj[]) =>
	Schema.decodeUnknown(
		Schema.Tuple(
			Schema.Struct({
				params: Schema.Tuple(IdentExp), // of a single ident.
				body: BlockStmt,
				env: Schema.Unknown, // setting this to env blows everything up
			}),
		),
	)(args).pipe(
		Effect.flatMap(
			([
				{
					params,
					body: { token, statements },
					env,
				},
			]) =>
				Effect.gen(function* () {
					// suppose instead I

					// ASSUME THERE IS ONLY A SINGLE STATEMENT - FOR NOW
					const expStmt = (yield* Schema.decodeUnknown(Schema.Tuple(ExpStmt))(
						statements,
					))[0];

					const newBody = BlockStmt.make({
						token,
						statements: [
							ExpStmt.make({
								...expStmt,
								expression: DiffExp.make({
									token: {
										_tag: "diff",
										literal: "diff",
									},
									exp: expStmt.expression,
									params,
								}),
							}),
						],
					});

					return FunctionObj.make({
						params,
						body: newBody,
						env: env as Environment,
					});
				}),
		),
	);

export const builtins = {
	len: BuiltInObj.make({ fn: "len" }),
	diff: BuiltInObj.make({ fn: "diff" }),
	sin: BuiltInObj.make({ fn: "sin" }),
	cos: BuiltInObj.make({ fn: "cos" }),
	tan: BuiltInObj.make({ fn: "tan" }),
	e: BuiltInObj.make({ fn: "e" }),
	ln: BuiltInObj.make({ fn: "ln" }),
	pi: BuiltInObj.make({ fn: "pi" }),
	exp: BuiltInObj.make({ fn: "exp" }),
} as const;

export const builtInFnMap = {
	len: (...args: Obj[]) =>
		Effect.gen(function* () {
			if (args.length !== 1) {
				return yield* Effect.succeed(
					ErrorObj.make({
						message: `wrong number of arguments. got=${args.length}, want=1`,
					}),
				);
			}

			const firstArg = args[0];

			return yield* Match.value(firstArg).pipe(
				Match.tag("StringObj", (strObj) =>
					Effect.succeed(IntegerObj.make({ value: strObj.value.length })),
				),
				Match.orElse(() =>
					Effect.succeed(
						ErrorObj.make({
							message: `argument to "len" not supported, got ${firstArg._tag}`,
						}),
					),
				),
			);
		}),
	diff,
	sin,
	cos,
	tan,
	ln,
	e,
	exp,
	pi,
} as const;

const builtinKeys = Object.keys(builtins) as (keyof typeof builtins)[]; // hack

export const builtinsKeySchema = Schema.Literal(...builtinKeys);

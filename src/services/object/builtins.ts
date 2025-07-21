import { ArrayObj } from "@/schemas/objs/array";
import { BuiltInObj } from "@/schemas/objs/built-in";
import { FunctionObj } from "@/schemas/objs/function";
import { IntegerObj } from "@/schemas/objs/int";
import { NULL, type NullObj } from "@/schemas/objs/null";
import { StringObj } from "@/schemas/objs/string";
import { Obj } from "@/schemas/objs/union";
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

const makeConstantFunction =
	(value: number) =>
	(...args: Obj[]) =>
		Effect.succeed(IntegerObj.make({ value })); // to get around not having decimals.

const pi = makeConstantFunction(Math.PI);
const e = makeConstantFunction(Math.E);

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
	first: BuiltInObj.make({ fn: "first" }),
} as const;

export const builtInFnMap = {
	len: (...args: Obj[]) =>
		Schema.decodeUnknown(Schema.Tuple(Schema.Union(StringObj, ArrayObj)))(
			args,
		).pipe(
			Effect.flatMap(([firstArg]) =>
				Match.value(firstArg).pipe(
					Match.tag("StringObj", (strObj) =>
						Effect.succeed(IntegerObj.make({ value: strObj.value.length })),
					),
					Match.tag("ArrayObj", ({ elements }) =>
						Effect.succeed(IntegerObj.make({ value: elements.length })),
					),
					Match.exhaustive,
				),
			),
		),
	first: (...args: Obj[]) =>
		Schema.decodeUnknown(Schema.Tuple(ArrayObj))(args).pipe(
			Effect.flatMap(([{ elements }]) =>
				elements.length > 0
					? Effect.succeed(elements[0])
					: Effect.succeed(NULL),
			),
		),
	last: (...args: Obj[]) =>
		Schema.decodeUnknown(Schema.Tuple(ArrayObj))(args).pipe(
			Effect.flatMap(([{ elements }]) =>
				elements.length > 0
					? Effect.succeed(elements[elements.length - 1])
					: Effect.succeed(NULL),
			),
		),
	rest: (...args: Obj[]) =>
		Schema.decodeUnknown(Schema.Tuple(ArrayObj))(args).pipe(
			Effect.flatMap(([{ elements }]) =>
				Effect.gen(function* () {
					return yield* elements.length > 0
						? Effect.succeed(ArrayObj.make({ elements: elements.slice(1) }))
						: Effect.succeed(NULL);
				}),
			),
		),
	push: (...args: Obj[]) =>
		Schema.decodeUnknown(Schema.Tuple(ArrayObj, Obj))(args).pipe(
			Effect.flatMap(([{ elements }, element]) =>
				Effect.succeed(ArrayObj.make({ elements: [...elements, element] })),
			),
		),
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

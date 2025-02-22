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

const diff2 = (...args: Obj[]) =>
	Effect.gen(function* () {
		// this is already evaluated hence Obj and not exps.
		const {
			params,
			body: { token, statements },
			env,
		} = (yield* Schema.decodeUnknown(
			Schema.Tuple(
				Schema.Struct({
					params: Schema.Tuple(IdentExp),
					body: BlockStmt,
					env: Schema.Unknown,
				}),
			),
		)(args))[0];
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

		return FunctionObj.make({ params, body: newBody, env: env as Environment });
	});

export const builtins = {
	len: BuiltInObj.make({
		fn: (...args: Obj[]) =>
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
	}),
	diff: BuiltInObj.make({ fn: diff2 }),
} as const;

const builtinKeys = Object.keys(builtins) as (keyof typeof builtins)[]; // hack

export const builtinsKeySchema = Schema.Literal(...builtinKeys);

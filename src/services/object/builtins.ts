import { Effect, Match, Schema } from "effect";
import { DiffExp } from "src/schemas/nodes/exps/diff";
import { IdentExp } from "src/schemas/nodes/exps/ident";
import { BlockStmt } from "src/schemas/nodes/stmts/block";
import { ExpStmt } from "src/schemas/nodes/stmts/exp";
import {
	type Obj,
	createBuiltInObj,
	createErrorObj,
	createFunctionObj,
	createIntegerObj,
} from ".";
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

		return createFunctionObj(params, newBody, env as Environment);
	});

export const builtins = {
	len: createBuiltInObj((...args: Obj[]) =>
		Effect.gen(function* () {
			if (args.length !== 1) {
				return yield* Effect.succeed(
					createErrorObj(
						`wrong number of arguments. got=${args.length}, want=1`,
					),
				);
			}

			const firstArg = args[0];

			return yield* Match.value(firstArg).pipe(
				Match.tag("StringObj", (strObj) =>
					Effect.succeed(createIntegerObj(strObj.value.length)),
				),
				Match.orElse(() =>
					Effect.succeed(
						createErrorObj(
							`argument to "len" not supported, got ${firstArg._tag}`,
						),
					),
				),
			);
		}),
	),
	diff: createBuiltInObj(diff2),
} as const;

const builtinKeys = Object.keys(builtins) as (keyof typeof builtins)[]; // hack

export const builtinsKeySchema = Schema.Literal(...builtinKeys);

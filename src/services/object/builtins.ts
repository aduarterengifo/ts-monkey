import { Effect, Match, Schema } from 'effect'
import { IdentExp } from 'src/schemas/nodes/exps/ident'
import { BlockStmt } from 'src/schemas/nodes/stmts/block'
import { DiffExp } from 'src/schemas/nodes/exps/diff'
import { environmentSchema } from './environment'
import { ExpStmt } from 'src/schemas/nodes/stmts/exp'
import { Obj } from '@/schemas/objs/union'
import { builtInObjSchema } from '@/schemas/objs/built-in'
import { errorObjSchema } from '@/schemas/objs/error'
import { intObjSchema } from '@/schemas/objs/int'
import { functionObjSchema } from '@/schemas/objs/function'

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
					env: environmentSchema,
				}),
			),
		)(args))[0]
		// ASSUME THERE IS ONLY A SINGLE STATEMENT - FOR NOW
		const expStmt = (yield* Schema.decodeUnknown(Schema.Tuple(ExpStmt))(
			statements,
		))[0]

		const newBody = new BlockStmt({
			token,
			statements: [
				new ExpStmt({
					...expStmt,
					expression: new DiffExp({
						token: {
							_tag: 'diff',
							literal: 'diff',
						},
						exp: expStmt.expression,
						params,
					}),
				}),
			],
		})

		return functionObjSchema.make({params, body: newBody, env})
	})

export const builtins = {
	len: builtInObjSchema.make({fn: 'len'}),
	diff: builtInObjSchema.make({fn: 'diff'}),
} as const

export const builtInFnMap = {
	len: (...args: Obj[]) =>
		Effect.gen(function* () {
			if (args.length !== 1) {
				return yield* Effect.succeed(
					errorObjSchema.make({message: `wrong number of arguments. got=${args.length}, want=1`})
				)
			}

			const firstArg = args[0]

			return yield* Match.value(firstArg).pipe(
				Match.tag('StringObj', (strObj) =>
					Effect.succeed(intObjSchema.make({value: strObj.value.length })),
				),
				Match.orElse(() =>
					Effect.succeed(
						errorObjSchema.make({message: `argument to "len" not supported, got ${firstArg._tag}` })
					),
				),
			)
		}),
	diff: diff2
} as const

const builtinKeys = Object.keys(builtins) as (keyof typeof builtins)[] // hack

export const builtinsKeySchema = Schema.Literal(...builtinKeys)

import { Schema } from 'effect'
import { IdentExp, type IdentExpEncoded } from '../nodes/exps/ident'
import { BlockStmt, type BlockStmtEncoded } from '../nodes/stmts/block'
import { Environment, EnvironmentEncoded, environmentSchema } from '@/services/object/environment'

export interface FunctionObj {
	readonly _tag: 'FunctionObj'
	readonly params: readonly IdentExp[]
	readonly body: BlockStmt
	readonly env: Environment
}

export interface FunctionObjEncoded {
	readonly _tag: 'FunctionObj'
	readonly params: readonly IdentExpEncoded[]
	readonly body: BlockStmtEncoded
	readonly env: EnvironmentEncoded
}

export const functionObjSchema = Schema.TaggedStruct('FunctionObj', {
	params: Schema.Array(
		Schema.suspend((): Schema.Schema<IdentExp, IdentExpEncoded> => IdentExp),
	),
	body: Schema.suspend(
		(): Schema.Schema<BlockStmt, BlockStmtEncoded> => BlockStmt,
	),
	env: Schema.suspend((): Schema.Schema<Environment, EnvironmentEncoded> => environmentSchema)
})

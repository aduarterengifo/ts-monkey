import { Schema } from 'effect'
import { IdentExp, type IdentExpEncoded } from '../nodes/exps/ident'
import { BlockStmt, type BlockStmtEncoded } from '../nodes/stmts/block'

const fields = {
	env: Schema.Unknown,
}

export interface FunctionObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: 'FunctionObj'
	readonly params: readonly IdentExp[]
	readonly body: BlockStmt
}

export interface FunctionObjEncoded extends Schema.Struct.Type<typeof fields> {
	readonly _tag: 'FunctionObj'
	readonly params: readonly IdentExpEncoded[]
	readonly body: BlockStmtEncoded
}

export const functionObjSchema = Schema.TaggedStruct('FunctionObj', {
	...fields,
	params: Schema.Array(
		Schema.suspend((): Schema.Schema<IdentExp, IdentExpEncoded> => IdentExp),
	),
	body: Schema.suspend(
		(): Schema.Schema<BlockStmt, BlockStmtEncoded> => BlockStmt,
	),
})

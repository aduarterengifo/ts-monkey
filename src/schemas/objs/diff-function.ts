import { Schema } from 'effect'
import { IdentExp, type IdentExpEncoded } from '../nodes/exps/ident'
import { BlockStmt, type BlockStmtEncoded } from '../nodes/stmts/block'

const fields = {
	env: Schema.Unknown,
}

export interface DiffFunctionObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: 'DiffFunctionObj'
	readonly params: readonly IdentExp[]
	readonly body: BlockStmt
}

export interface DiffFunctionObjEncoded
	extends Schema.Struct.Type<typeof fields> {
	readonly _tag: 'DiffFunctionObj'
	readonly params: readonly IdentExpEncoded[]
	readonly body: BlockStmtEncoded
}

export const diffFunctionObjSchema = Schema.TaggedStruct('DiffFunctionObj', {
	...fields,
	params: Schema.Array(
		Schema.suspend((): Schema.Schema<IdentExp, IdentExpEncoded> => IdentExp),
	),
	body: Schema.suspend(
		(): Schema.Schema<BlockStmt, BlockStmtEncoded> => BlockStmt,
	),
})

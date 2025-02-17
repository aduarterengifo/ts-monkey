import { Schema } from 'effect'
import type { INode } from '../interfaces/internal-node'
import { BlockStmt, type BlockStmtEncoded } from '../stmts/block'
import { type FnToken, fnTokenSchema } from 'src/schemas/token/function-literal'
import { IdentExp, type IdentExpEncoded } from './ident'

export type FuncExpEncoded = {
	readonly _tag: 'FuncExp'
	readonly token: FnToken
	parameters: readonly IdentExpEncoded[]
	readonly body: BlockStmtEncoded
}

export class FuncExp
	extends Schema.TaggedClass<FuncExp>()('FuncExp', {
		token: fnTokenSchema,
		parameters: Schema.Array(
			Schema.suspend((): Schema.Schema<IdentExp, IdentExpEncoded> => IdentExp),
		),
		body: BlockStmt,
	})
	implements INode
{
	tokenLiteral() {
		return this.token.literal
	}
	string() {
		return `
			${this.tokenLiteral()}
			(
			${this.parameters.map((param) => param.string()).join(', ')}
			)
			${this.body.string()}
			`
	}
}

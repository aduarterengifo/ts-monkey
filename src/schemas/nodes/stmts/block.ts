import { Schema } from 'effect'
import type { INode } from '../interfaces/internal-node'
import { type Stmt, stmtSchema, type StmtEncoded } from './union'
import { type Token, tokenSchema } from '../../../schemas/token/unions/all'

export type BlockStmtEncoded = {
	readonly _tag: 'BlockStmt'
	readonly token: Token
	statements: readonly StmtEncoded[]
}

export class BlockStmt
	extends Schema.TaggedClass<BlockStmt>()('BlockStmt', {
		token: tokenSchema,
		statements: Schema.Array(
			Schema.suspend((): Schema.Schema<Stmt, StmtEncoded> => stmtSchema),
		),
	})
	implements INode
{
	tokenLiteral() {
		return `${this.token.literal}`
	}
	string() {
		return this.statements.map((stmt: Stmt): string => stmt.string()).join('\n')
	}
}

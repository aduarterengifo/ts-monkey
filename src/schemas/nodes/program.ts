import { Schema } from 'effect'
import type { INode } from './interfaces/internal-node'
import { type Stmt, stmtSchema, type StmtEncoded } from './stmts/union'
import type { IStatement } from './interfaces/internal-statement'
import { type Token, tokenSchema } from '../token/unions/all'

export type ReturnStmtEncoded = {
	readonly _tag: 'ReturnStmt'
	readonly token: Token
	statements: StmtEncoded[]
}

export class Program
	extends Schema.TaggedClass<Program>()('Program', {
		token: tokenSchema,
		statements: Schema.Array(
			Schema.suspend((): Schema.Schema<Stmt, StmtEncoded> => stmtSchema),
		),
	})
	implements INode, IStatement
{
	statementNode() {}
	tokenLiteral() {
		return this.statements.length > 0 ? this.statements[0].tokenLiteral() : ''
	}
	string() {
		return this.statements.map((statement) => statement.string()).join('')
	}
}

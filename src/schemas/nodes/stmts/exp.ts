import { Schema } from 'effect'
import type { INode } from '../interfaces/internal-node'
import { type Token, tokenSchema } from '../../../schemas/token/unions/all'
import { type Exp, expSchema, type ExpEncoded } from '../exps/union'

export type ExpStmtEncoded = {
	readonly _tag: 'ExpStmt'
	readonly token: Token
	readonly expression: ExpEncoded
}

export class ExpStmt
	extends Schema.TaggedClass<ExpStmt>()('ExpStmt', {
		token: tokenSchema,
		expression: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	})
	implements INode
{
	tokenLiteral() {
		return `${this.token.literal}`
	}
	string() {
		return this.expression.string()
	}
}

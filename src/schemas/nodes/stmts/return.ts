import { Schema } from 'effect'
import type { INode } from '../interfaces/internal-node'
import { type Token, tokenSchema } from '../../../schemas/token/unions/all'
import { type Exp, expSchema, type ExpEncoded } from '../exps/union'

export type ReturnStmtEncoded = {
	readonly _tag: 'ReturnStmt'
	readonly token: Token
	readonly value: ExpEncoded
}

export class ReturnStmt
	extends Schema.TaggedClass<ReturnStmt>()('ReturnStmt', {
		token: tokenSchema,
		value: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	})
	implements INode
{
	tokenLiteral() {
		return `${this.token.literal}`
	}
	string() {
		return `${this.tokenLiteral()} ${this.value.string()};`
	}
}

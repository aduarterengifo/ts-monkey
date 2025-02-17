import { Schema } from 'effect'
import type { INode } from '../interfaces/internal-node'
import { type Exp, expSchema, type ExpEncoded } from '../exps/union'
import { IdentExp, type IdentExpEncoded } from '../exps/ident'
import { type LetToken, letTokenSchema } from '../../../schemas/token/let'

export type LetStmtEncoded = {
	readonly _tag: 'LetStmt'
	readonly name: IdentExpEncoded
	readonly token: LetToken
	readonly value: ExpEncoded
}

export class LetStmt
	extends Schema.TaggedClass<LetStmt>()('LetStmt', {
		name: Schema.suspend(
			(): Schema.Schema<IdentExp, IdentExpEncoded> => IdentExp,
		),
		token: letTokenSchema,
		value: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	})
	implements INode
{
	tokenLiteral() {
		return `${this.token.literal}`
	}
	string() {
		return `${this.tokenLiteral()} ${this.name.string()} = ${this.value.string()};`
	}
}

import { Schema } from 'effect'
import { type Token, tokenSchema } from 'src/schemas/token/unions/all'
import type { INode } from '../interfaces/internal-node'
import { type Exp, expSchema, type ExpEncoded } from './union'
import {
	type InfixOperator,
	infixOperatorSchema,
} from 'src/schemas/infix-operator'

export type InfixExpEncoded = {
	readonly _tag: 'InfixExp'
	readonly token: Token
	readonly operator: InfixOperator
	readonly left: ExpEncoded
	readonly right: ExpEncoded
}

export class InfixExp
	extends Schema.TaggedClass<InfixExp>()('InfixExp', {
		token: tokenSchema,
		operator: infixOperatorSchema,
		left: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
		right: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	})
	implements INode
{
	tokenLiteral() {
		return `${this.token.literal}`
	}
	string() {
		const t: string = `(${this.left.string()} ${this.operator} ${this.right.string()})`
		return t
	}
}

export const OpInfixExp = (op: InfixOperator) => (left: Exp, right: Exp) =>
	new InfixExp({
		token: {
			_tag: op,
			literal: op,
		},
		operator: op,
		left,
		right,
	})

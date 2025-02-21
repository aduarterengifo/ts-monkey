import { Schema } from 'effect'
import { type DiffToken, diffTokenSchema } from 'src/schemas/token/diff'
import { type Exp, type ExpEncoded, expSchema } from './union'
import { IdentExp, type IdentExpEncoded } from './ident'

export type DiffExpEncoded = {
	readonly _tag: 'DiffExp'
	readonly token: DiffToken
	readonly exp: ExpEncoded
	readonly params: readonly IdentExp[]
}

export class DiffExp extends Schema.TaggedClass<DiffExp>()('DiffExp', {
	token: diffTokenSchema,
	exp: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	params: Schema.Array(
		Schema.suspend((): Schema.Schema<IdentExp, IdentExpEncoded> => IdentExp),
	),
}) {
	tokenLiteral() {
		return this.token.literal
	}
	string() {
		return `${this.tokenLiteral()}`
	}
}

import { Schema } from 'effect'
import { TokenType } from '../token-types/union'

export const intTokenSchema = Schema.TaggedStruct(TokenType.INT, {
	_tag: Schema.Literal(TokenType.INT),
	literal: Schema.String,
})

export type IntToken = typeof intTokenSchema.Type

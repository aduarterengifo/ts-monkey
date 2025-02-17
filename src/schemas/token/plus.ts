import { Schema } from 'effect'
import { TokenType } from '../token-types/union'

export const plusTokenSchema = Schema.TaggedStruct(TokenType.PLUS, {
	literal: Schema.Literal(TokenType.PLUS),
})

export type PlusToken = typeof plusTokenSchema.Type

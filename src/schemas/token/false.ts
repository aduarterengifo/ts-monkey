import { Schema } from 'effect'
import { TokenType } from '../token-types/union'

export const falseTokenSchema = Schema.TaggedStruct(TokenType.FALSE, {
	literal: Schema.String,
})

export type FalseToken = typeof falseTokenSchema.Type

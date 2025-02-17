import { Schema } from 'effect'
import { TokenType } from '../token-types/union'

export const identTokenSchema = Schema.TaggedStruct(TokenType.IDENT, {
	literal: Schema.String,
})

export type IdentToken = typeof identTokenSchema.Type

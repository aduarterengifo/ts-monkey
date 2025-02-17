import { Schema } from 'effect'
import { TokenType } from '../token-types/union'

export const diffTokenSchema = Schema.TaggedStruct(TokenType.DIFF, {
	literal: Schema.String,
})

export type DiffToken = typeof diffTokenSchema.Type

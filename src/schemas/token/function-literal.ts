import { Schema } from 'effect'
import { TokenType } from '../token-types/union'

export const fnTokenSchema = Schema.TaggedStruct(TokenType.FUNCTION, {
	literal: Schema.String,
})

export type FnToken = typeof fnTokenSchema.Type

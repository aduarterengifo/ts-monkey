import { Schema } from 'effect'
import { TokenType } from '../token-types/union'

export const trueTokenSchema = Schema.TaggedStruct(TokenType.TRUE, {
	literal: Schema.String,
})

export type TrueToken = typeof trueTokenSchema.Type

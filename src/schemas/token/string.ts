import { Schema } from 'effect'
import { TokenType } from '../token-types/union'

export const stringTokenSchema = Schema.TaggedStruct(TokenType.STRING, {
	literal: Schema.String,
})

export type StringToken = typeof stringTokenSchema.Type

import { Schema } from 'effect'
import type { TokenType } from 'src/schemas/token-types/union'

export const createTokenLiteralSchema = <T extends TokenType>(tokenType: T) =>
	Schema.TaggedStruct(tokenType, {
		literal: Schema.Literal(tokenType),
	})

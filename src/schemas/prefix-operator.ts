import { Schema } from 'effect'
import { TokenType } from './token-types/union'

export const prefixOperatorSchema = Schema.Literal(
	TokenType.BANG,
	TokenType.MINUS,
)

export type PrefixOperator = typeof prefixOperatorSchema.Type

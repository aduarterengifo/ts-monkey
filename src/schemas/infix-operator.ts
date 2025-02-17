import { Schema } from 'effect'
import { TokenType } from './token-types/union'

export const infixOperatorSchema = Schema.Literal(
	TokenType.PLUS,
	TokenType.MINUS,
	TokenType.ASTERISK,
	TokenType.SLASH,
	TokenType.LT,
	TokenType.GT,
	TokenType.EQ,
	TokenType.NOT_EQ,
	TokenType.EXPONENT,
)

export type InfixOperator = typeof infixOperatorSchema.Type

import { Schema } from 'effect'
import { TokenType } from './token-types/union'

export const polynomialOperatorSchema = Schema.Literal(
	TokenType.PLUS,
	TokenType.MINUS,
	TokenType.ASTERISK,
	TokenType.SLASH,
	TokenType.EXPONENT,
)

export type PolynomialOperator = typeof polynomialOperatorSchema.Type

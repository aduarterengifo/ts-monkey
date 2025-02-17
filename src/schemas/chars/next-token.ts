import { Schema } from 'effect'
import { TokenType } from '../token-types/union'

export const lexerSymbolSchema = Schema.Literal(
	TokenType.ASSIGN,
	TokenType.BANG,
	TokenType.MINUS,
	TokenType.EXPONENT,
	TokenType.SLASH,
	TokenType.ASTERISK,
	TokenType.LT,
	TokenType.GT,
	TokenType.SEMICOLON,
	TokenType.LPAREN,
	TokenType.RPAREN,
	TokenType.COMMA,
	TokenType.PLUS,
	TokenType.LBRACE,
	TokenType.RBRACE,
	TokenType.EOF,
	TokenType.QUOTE,
)

export type LexerNextTokenSymbol = typeof lexerSymbolSchema.Type

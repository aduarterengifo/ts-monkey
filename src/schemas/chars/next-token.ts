import { Schema } from "effect";
import { TokenType } from "../token-types/union";

// I'm conviced this is just finite-tokentypes
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
	TokenType.LBRACKET,
	TokenType.RBRACKET,
);

export type LexerNextTokenSymbol = typeof lexerSymbolSchema.Type;

import { Schema } from 'effect'

export const FiniteTokenType = {
	ASSIGN: '=',
	PLUS: '+',
	MINUS: '-',
	SLASH: '/',
	COMMA: ',',
	SEMICOLON: ';',
	LPAREN: '(',
	RPAREN: ')',
	LBRACE: '{',
	RBRACE: '}',
	BANG: '!',
	LT: '<',
	GT: '>',
	ASTERISK: '*',
	QUOTE: '"',
	EOF: '\0',
	EQ: '==',
	NOT_EQ: '!=',
	EXPONENT: '**',
	LET: 'let',
	IF: 'if',
	ELSE: 'else',
	FUNCTION: 'fn',
	TRUE: 'true',
	FALSE: 'false',
	RETURN: 'return',
	DIFF: 'diff',
	ILLEGAL: '', // doesn't quite fit.
} as const

export const finiteTokenTypeSchema = Schema.Literal(
	...Object.values(FiniteTokenType),
)

export type FiniteTokenType = typeof finiteTokenTypeSchema.Type

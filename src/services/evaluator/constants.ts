import { TokenType } from '../../schemas/token-types/union'

export const OPERATOR_TO_FUNCTION_MAP = {
	[TokenType.PLUS]: (a: number, b: number) => a + b,
	[TokenType.MINUS]: (a: number, b: number) => a - b,
	[TokenType.ASTERISK]: (a: number, b: number) => a * b,
	[TokenType.SLASH]: (a: number, b: number) => a / b,
	[TokenType.EXPONENT]: (a: number, b: number) => a ** b,
	[TokenType.LT]: (a: number, b: number) => a < b,
	[TokenType.GT]: (a: number, b: number) => a > b,
	[TokenType.EQ]: <T>(a: T, b: T) => a === b,
	[TokenType.NOT_EQ]: <T>(a: T, b: T) => a !== b,
} as const

export const STRING_OPERATOR_TO_FUNCTION_MAP = {
	[TokenType.PLUS]: (a: string, b: string) => a + b,
} as const

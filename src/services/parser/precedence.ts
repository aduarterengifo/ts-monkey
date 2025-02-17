import { Brand } from 'effect'
import { TokenType } from '../../schemas/token-types/union'

export const LOWEST = Brand.nominal<LOWEST>()(0)
export const EQUALS = Brand.nominal<EQUALS>()(1)
export const LESSGREATER = Brand.nominal<LESSGREATER>()(2)
export const SUM = Brand.nominal<SUM>()(3)
export const PRODUCT = Brand.nominal<PRODUCT>()(4)
export const EXPONENT = Brand.nominal<EXPONENT>()(5)
export const PREFIX = Brand.nominal<PREFIX>()(6)
export const CALL = Brand.nominal<CALL>()(7)

export type LOWEST = 0 & Brand.Brand<'LOWEST'>
export type EQUALS = 1 & Brand.Brand<'EQUALS'>
export type LESSGREATER = 2 & Brand.Brand<'LESSGREATER'>
export type SUM = 3 & Brand.Brand<'SUM'>
export type PRODUCT = 4 & Brand.Brand<'PRODUCT'>
export type EXPONENT = 5 & Brand.Brand<'EXPONENT'>
export type PREFIX = 6 & Brand.Brand<'PREFIX'>
export type CALL = 7 & Brand.Brand<'CALL'>

export type Precedence =
	| LOWEST
	| EQUALS
	| LESSGREATER
	| SUM
	| PRODUCT
	| EXPONENT
	| PREFIX
	| CALL

export const tokenTypeToPrecedenceMap: ReadonlyMap<TokenType, Precedence> =
	new Map<TokenType, Precedence>([
		[TokenType.EQ, EQUALS],
		[TokenType.NOT_EQ, EQUALS],
		[TokenType.LT, LESSGREATER],
		[TokenType.GT, LESSGREATER],
		[TokenType.PLUS, SUM],
		[TokenType.MINUS, SUM],
		[TokenType.ASTERISK, PRODUCT],
		[TokenType.EXPONENT, EXPONENT],
		[TokenType.SLASH, PRODUCT],
		[TokenType.LPAREN, CALL],
	])

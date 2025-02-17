import { TokenType } from '../schemas/token-types/union'

export const keywords = {
	fn: TokenType.FUNCTION,
	let: TokenType.LET,
	true: TokenType.TRUE,
	false: TokenType.FALSE,
	if: TokenType.IF,
	else: TokenType.ELSE,
	return: TokenType.RETURN,
	// diff: TokenType.DIFF, // uncomment to have a special DIFF NODE
} as const

export function lookupIndent(ident: string) {
	return ident in keywords
		? keywords[ident as keyof typeof keywords]
		: TokenType.IDENT
}

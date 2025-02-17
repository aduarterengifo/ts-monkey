import { TokenType } from '../token-types/union'
import { createTokenLiteralSchema } from '../utils/create-token-literal-schema'

export const groupedTokenSchema = createTokenLiteralSchema(TokenType.LPAREN)

export type GroupedToken = typeof groupedTokenSchema.Type

import { TokenType } from '../token-types/union'
import { createTokenLiteralSchema } from '../utils/create-token-literal-schema'

export const lpTokenSchema = createTokenLiteralSchema(TokenType.LPAREN)

export type LpToken = typeof lpTokenSchema.Type

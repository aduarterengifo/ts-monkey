import { TokenType } from '../token-types/union'
import { createTokenLiteralSchema } from '../utils/create-token-literal-schema'

export const asteriskTokenSchema = createTokenLiteralSchema(TokenType.ASTERISK)

export type AsteriskToken = typeof asteriskTokenSchema.Type

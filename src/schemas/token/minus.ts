import { TokenType } from '../token-types/union'
import { createTokenLiteralSchema } from '../utils/create-token-literal-schema'

export const minusTokenSchema = createTokenLiteralSchema(TokenType.MINUS)

export type MinusToken = typeof minusTokenSchema.Type

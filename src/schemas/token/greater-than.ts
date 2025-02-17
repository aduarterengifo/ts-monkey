import { TokenType } from '../token-types/union'
import { createTokenLiteralSchema } from '../utils/create-token-literal-schema'

export const gtTokenSchema = createTokenLiteralSchema(TokenType.GT)

export type GtToken = typeof gtTokenSchema.Type

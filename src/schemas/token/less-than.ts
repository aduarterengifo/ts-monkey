import { TokenType } from '../token-types/union'
import { createTokenLiteralSchema } from '../utils/create-token-literal-schema'

export const ltTokenSchema = createTokenLiteralSchema(TokenType.LT)

export type LtToken = typeof ltTokenSchema.Type

import { TokenType } from '../token-types/union'
import { createTokenLiteralSchema } from '../utils/create-token-literal-schema'

export const eqTokenSchema = createTokenLiteralSchema(TokenType.EQ)

export type EqToken = typeof eqTokenSchema.Type

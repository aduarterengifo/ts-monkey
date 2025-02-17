import { TokenType } from '../token-types/union'
import { createTokenLiteralSchema } from '../utils/create-token-literal-schema'

export const exponentTokenSchema = createTokenLiteralSchema(TokenType.EXPONENT)

export type ExponentToken = typeof exponentTokenSchema.Type

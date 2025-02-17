import { TokenType } from '../token-types/union'
import { createTokenLiteralSchema } from '../utils/create-token-literal-schema'

export const bangTokenSchema = createTokenLiteralSchema(TokenType.BANG)

export type BangToken = typeof bangTokenSchema.Type

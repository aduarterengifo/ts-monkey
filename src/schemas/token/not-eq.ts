import { TokenType } from '../token-types/union'
import { createTokenLiteralSchema } from '../utils/create-token-literal-schema'

export const notEqTokenSchema = createTokenLiteralSchema(TokenType.NOT_EQ)

export type NotEqToken = typeof notEqTokenSchema.Type

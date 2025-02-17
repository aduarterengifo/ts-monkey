import { TokenType } from '../token-types/union'
import { createTokenLiteralSchema } from '../utils/create-token-literal-schema'

export const letTokenSchema = createTokenLiteralSchema(TokenType.LET)

export type LetToken = typeof letTokenSchema.Type

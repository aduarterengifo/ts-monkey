import { TokenType } from '../token-types/union'
import { createTokenLiteralSchema } from '../utils/create-token-literal-schema'

export const ifTokenSchema = createTokenLiteralSchema(TokenType.IF)

export type IfToken = typeof ifTokenSchema.Type

import { TokenType } from '../token-types/union'
import { createTokenLiteralSchema } from '../utils/create-token-literal-schema'

export const returnTokenSchema = createTokenLiteralSchema(TokenType.RETURN)

export type ReturnToken = typeof returnTokenSchema.Type

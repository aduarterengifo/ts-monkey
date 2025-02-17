import { TokenType } from '../token-types/union'
import { createTokenLiteralSchema } from '../utils/create-token-literal-schema'

export const slashTokenSchema = createTokenLiteralSchema(TokenType.SLASH)

export type SlashToken = typeof slashTokenSchema.Type

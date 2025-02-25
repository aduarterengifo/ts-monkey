import { TokenType } from "../token-types/union";
import { createTokenLiteralSchema } from "../utils/create-token-literal-schema";

export const RBRACKET = createTokenLiteralSchema(TokenType.RBRACKET);

export type RBRACKET = typeof RBRACKET.Type;

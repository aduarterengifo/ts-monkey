import { TokenType } from "../token-types/union";
import { createTokenLiteralSchema } from "../utils/create-token-literal-schema";

export const LBRACKET = createTokenLiteralSchema(TokenType.LBRACKET);

export type LBRACKET = typeof LBRACKET.Type;

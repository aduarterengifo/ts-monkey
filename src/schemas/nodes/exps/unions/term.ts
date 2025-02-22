import { TokenType } from "@/schemas/token-types/union";
import type { IdentExp } from "../ident";
import { OpInfixExp } from "../infix";
import { nativeToIntExp } from "../int";

export const newTerm = (coeff: number, x: IdentExp, power: number) =>
	OpInfixExp(TokenType.ASTERISK)(
		nativeToIntExp(coeff),
		OpInfixExp(TokenType.EXPONENT)(x, nativeToIntExp(power)),
	);

import { Schema } from "effect";
import { asteriskTokenSchema } from "../../asterisk";
import { eqTokenSchema } from "../../eq";
import { exponentTokenSchema } from "../../exponent";
import { gtTokenSchema } from "../../greater-than";
import { LBRACKET } from "../../lbracket";
import { lpTokenSchema } from "../../left-paren";
import { ltTokenSchema } from "../../less-than";
import { minusTokenSchema } from "../../minus";
import { notEqTokenSchema } from "../../not-eq";
import { plusTokenSchema } from "../../plus";
import { slashTokenSchema } from "../../slash";

export const infixParseFnTokenSchema = Schema.Union(
	plusTokenSchema,
	minusTokenSchema,
	slashTokenSchema,
	asteriskTokenSchema,
	eqTokenSchema,
	notEqTokenSchema,
	ltTokenSchema,
	gtTokenSchema,
	lpTokenSchema,
	exponentTokenSchema,
	LBRACKET,
);

export type InfixParseFnToken = typeof infixParseFnTokenSchema.Type;

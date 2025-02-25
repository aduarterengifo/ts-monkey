import { Schema } from "effect";
import { fnTokenSchema } from "../../function-literal";
import { groupedTokenSchema } from "../../grouped";
import { identTokenSchema } from "../../ident";
import { ifTokenSchema } from "../../if";
import { intTokenSchema } from "../../int";
import { LBRACKET } from "../../lbracket";
import { stringTokenSchema } from "../../string";
import { boolTokenSchema } from "../boolean";
import { prefixTokenSchema } from "../prefix";

export const prefixParseFnTokenSchema = Schema.Union(
	identTokenSchema,
	intTokenSchema,
	ifTokenSchema,
	fnTokenSchema,
	boolTokenSchema,
	prefixTokenSchema,
	stringTokenSchema,
	groupedTokenSchema,
	LBRACKET,
);

export type PrefixParseFnToken = typeof prefixParseFnTokenSchema.Type;

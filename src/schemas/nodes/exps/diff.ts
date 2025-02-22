import { Schema } from "effect";
import { type DiffToken, diffTokenSchema } from "src/schemas/token/diff";
import { IdentExp } from "./ident";
import { Exp } from "./union";

export type DiffExp = {
	readonly _tag: "DiffExp";
	readonly token: DiffToken;
	readonly exp: Exp;
	readonly params: readonly IdentExp[];
};

export const DiffExp = Schema.TaggedStruct("DiffExp", {
	token: diffTokenSchema,
	exp: Schema.suspend((): Schema.Schema<Exp> => Exp),
	params: Schema.Array(Schema.suspend((): Schema.Schema<IdentExp> => IdentExp)),
});

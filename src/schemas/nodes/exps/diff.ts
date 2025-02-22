import { Schema } from "effect";
import { type DiffToken, diffTokenSchema } from "src/schemas/token/diff";
import { IdentExp, type IdentExpEncoded } from "./ident";
import { type Exp, type ExpEncoded, expSchema } from "./union";

export type DiffExpEncoded = {
	readonly _tag: "DiffExp";
	readonly token: DiffToken;
	readonly exp: ExpEncoded;
	readonly params: readonly IdentExpEncoded[];
};

export type DiffExp = {
	readonly _tag: "DiffExp";
	readonly token: DiffToken;
	readonly exp: Exp;
	readonly params: readonly IdentExp[];
};

export const DiffExp = Schema.TaggedStruct("DiffExp", {
	token: diffTokenSchema,
	exp: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	params: Schema.Array(
		Schema.suspend((): Schema.Schema<IdentExp, IdentExpEncoded> => IdentExp),
	),
});

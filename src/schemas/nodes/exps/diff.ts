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

export class DiffExp extends Schema.TaggedClass<DiffExp>()("DiffExp", {
	token: diffTokenSchema,
	exp: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	params: Schema.Array(
		Schema.suspend((): Schema.Schema<IdentExp, IdentExpEncoded> => IdentExp),
	),
}) {
	string() {
		return `${this.token.literal}`;
	}
}

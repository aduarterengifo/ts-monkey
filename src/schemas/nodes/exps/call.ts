import { Schema } from "effect";
import { type Token, tokenSchema } from "src/schemas/token/unions/all";
import { Exp } from "./union";

export type CallExp = {
	readonly _tag: "CallExp";
	readonly token: Token;
	readonly fn: Exp;
	readonly args: readonly Exp[];
};

export const CallExp = Schema.TaggedStruct("CallExp", {
	token: tokenSchema,
	fn: Schema.suspend((): Schema.Schema<Exp> => Exp),
	args: Schema.Array(Schema.suspend((): Schema.Schema<Exp> => Exp)),
});

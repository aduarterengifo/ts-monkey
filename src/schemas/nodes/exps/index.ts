import { type Token, tokenSchema } from "@/schemas/token/unions/all";
import { Schema } from "effect";
import { Exp } from "./union";

export type IndexExp = {
	readonly _tag: "IndexExp";
	readonly token: Token;
	readonly left: Exp;
	readonly index: Exp;
};

export const IndexExp = Schema.TaggedStruct("IndexExp", {
	token: tokenSchema,
	left: Schema.suspend((): Schema.Schema<Exp> => Exp),
	index: Schema.suspend((): Schema.Schema<Exp> => Exp),
});

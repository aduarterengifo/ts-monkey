import { type Token, tokenSchema } from "@/schemas/token/unions/all";
import { Schema } from "effect";
import { Exp } from "./union";

export type ArrayExp = {
	readonly _tag: "ArrayExp";
	readonly token: Token;
	readonly elements: readonly Exp[];
};

export const ArrayExp = Schema.TaggedStruct("ArrayExp", {
	token: tokenSchema,
	elements: Schema.Array(Schema.suspend((): Schema.Schema<Exp> => Exp)),
});

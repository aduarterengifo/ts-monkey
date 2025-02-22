import { Schema } from "effect";
import { type Token, tokenSchema } from "src/schemas/token/unions/all";
import { type Exp, type ExpEncoded, expSchema } from "./union";

export type CallExpEncoded = {
	readonly _tag: "CallExp";
	readonly token: Token;
	readonly fn: ExpEncoded;
	readonly args: readonly ExpEncoded[];
};

export type CallExp = {
	readonly _tag: "CallExp";
	readonly token: Token;
	readonly fn: ExpEncoded;
	readonly args: readonly ExpEncoded[];
};

export const CallExp = Schema.TaggedStruct("CallExp", {
	token: tokenSchema,
	fn: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	args: Schema.Array(
		Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	),
});

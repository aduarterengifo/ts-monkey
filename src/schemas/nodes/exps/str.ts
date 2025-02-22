import { Schema } from "effect";
import { type StringToken, stringTokenSchema } from "src/schemas/token/string";

export type StrExp = {
	readonly _tag: "StrExp";
	readonly token: StringToken;
	readonly value: string;
};

export const StrExp = Schema.TaggedStruct("StrExp", {
	token: stringTokenSchema,
	value: Schema.String,
});

export const StrExpEq = Schema.equivalence(StrExp);

export const nativeToStrExp = (str: string) =>
	StrExp.make({
		token: {
			_tag: "STRING",
			literal: str,
		},
		value: str,
	});

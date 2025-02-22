import { Schema } from "effect";
import { tokenSchema } from "src/schemas/token/unions/all";

export type BoolExpEncoded = Schema.Schema.Encoded<typeof BoolExp>;

export const BoolExp = Schema.TaggedStruct("BoolExp", {
	token: tokenSchema,
	value: Schema.Boolean,
});

export type BoolExp = typeof BoolExp.Type;

export const BoolExpEq = Schema.equivalence(BoolExp);

export const nativeToBoolExp = (bool: boolean) =>
	BoolExp.make({
		token: {
			_tag: `${bool}`,
			literal: `${bool}`,
		},
		value: bool,
	});

import { Schema } from "effect";
import { type IntToken, intTokenSchema } from "../../../schemas/token/int";

export type IntExp = {
	readonly _tag: "IntExp";
	readonly token: IntToken;
	readonly value: number;
};

export const IntExp = Schema.TaggedStruct("IntExp", {
	token: intTokenSchema,
	value: Schema.Number,
});

export const IntExpEq = Schema.equivalence(IntExp);

export const nativeToIntExp = (int: number) =>
	IntExp.make({
		token: {
			_tag: "INT",
			literal: `${int}`,
		},
		value: int,
	});

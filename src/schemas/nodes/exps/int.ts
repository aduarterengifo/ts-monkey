import { Schema } from "effect";
import { type IntToken, intTokenSchema } from "../../../schemas/token/int";
import type { INode } from "../interfaces/internal-node";

export type IntExpEncoded = {
	readonly _tag: "IntExp";
	readonly token: IntToken;
	readonly value: number;
};

export class IntExp
	extends Schema.TaggedClass<IntExp>()("IntExp", {
		token: intTokenSchema,
		value: Schema.Number,
	})
	implements INode {}

export const IntExpEq = Schema.equivalence(IntExp);

export const nativeToIntExp = (int: number) =>
	new IntExp({
		token: {
			_tag: "INT",
			literal: `${int}`,
		},
		value: int,
	});

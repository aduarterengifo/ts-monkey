import { Schema } from "effect";
import { type StringToken, stringTokenSchema } from "src/schemas/token/string";
import type { INode } from "../interfaces/internal-node";

export type StrExpEncoded = {
	readonly _tag: "StrExp";
	readonly token: StringToken;
	readonly value: string;
};

export class StrExp
	extends Schema.TaggedClass<StrExp>()("StrExp", {
		token: stringTokenSchema,
		value: Schema.String,
	})
	implements INode {}

export const StrExpEq = Schema.equivalence(StrExp);

export const nativeToStrExp = (str: string) =>
	new StrExp({
		token: {
			_tag: "STRING",
			literal: str,
		},
		value: str,
	});

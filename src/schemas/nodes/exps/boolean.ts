import { Schema } from "effect";
import { tokenSchema } from "src/schemas/token/unions/all";
import type { INode } from "../interfaces/internal-node";

export type BoolExpEncoded = Schema.Schema.Encoded<typeof BoolExp>;

export class BoolExp
	extends Schema.TaggedClass<BoolExp>()("BoolExp", {
		token: tokenSchema,
		value: Schema.Boolean,
	})
	implements INode
{
	string() {
		return `${this.token.literal}`;
	}
}

export const BoolExpEq = Schema.equivalence(BoolExp);

export const nativeToBoolExp = (bool: boolean) =>
	new BoolExp({
		token: {
			_tag: `${bool}`,
			literal: `${bool}`,
		},
		value: bool,
	});

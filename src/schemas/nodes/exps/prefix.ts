import { Schema } from "effect";
import {
	type PrefixOperator,
	prefixOperatorSchema,
} from "src/schemas/prefix-operator";
import { type Token, tokenSchema } from "src/schemas/token/unions/all";
import { Exp } from "./union";

export type PrefixExp = {
	readonly _tag: "PrefixExp";
	readonly token: Token;
	readonly operator: PrefixOperator;
	readonly right: Exp;
};

export const PrefixExp = Schema.TaggedStruct("PrefixExp", {
	token: tokenSchema,
	operator: prefixOperatorSchema,
	right: Schema.suspend((): Schema.Schema<Exp> => Exp),
});

export const opPrefixExp = (op: PrefixOperator) => (right: Exp) =>
	PrefixExp.make({
		token: {
			_tag: op,
			literal: op,
		},
		operator: op,
		right,
	});

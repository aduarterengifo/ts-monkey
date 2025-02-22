import { Schema } from "effect";
import {
	type PrefixOperator,
	prefixOperatorSchema,
} from "src/schemas/prefix-operator";
import { type Token, tokenSchema } from "src/schemas/token/unions/all";
import { type Exp, expSchema } from "./union";

export type PrefixExp = {
	readonly _tag: "PrefixExp";
	readonly token: Token;
	readonly operator: PrefixOperator;
	readonly right: Exp;
};

export const PrefixExp = Schema.TaggedStruct("PrefixExp", {
	token: tokenSchema,
	operator: prefixOperatorSchema,
	right: Schema.suspend((): Schema.Schema<Exp> => expSchema),
});

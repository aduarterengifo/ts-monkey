import { Schema } from "effect";
import {
	type PrefixOperator,
	prefixOperatorSchema,
} from "src/schemas/prefix-operator";
import { type Token, tokenSchema } from "src/schemas/token/unions/all";
import type { INode } from "../interfaces/internal-node";
import { type Exp, type ExpEncoded, expSchema } from "./union";

export type PrefixExpEncoded = {
	readonly _tag: "PrefixExp";
	readonly token: Token;
	readonly operator: PrefixOperator;
	readonly right: ExpEncoded;
};

export class PrefixExp
	extends Schema.TaggedClass<PrefixExp>()("PrefixExp", {
		token: tokenSchema,
		operator: prefixOperatorSchema,
		right: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	})
	implements INode {}

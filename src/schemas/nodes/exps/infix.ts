import { Schema } from "effect";
import {
	type InfixOperator,
	infixOperatorSchema,
} from "src/schemas/infix-operator";
import { type Token, tokenSchema } from "src/schemas/token/unions/all";
import { type Exp, type ExpEncoded, expSchema } from "./union";

export type InfixExpEncoded = {
	readonly _tag: "InfixExp";
	readonly token: Token;
	readonly operator: InfixOperator;
	readonly left: ExpEncoded;
	readonly right: ExpEncoded;
};

export type InfixExp = {
	readonly _tag: "InfixExp";
	readonly token: Token;
	readonly operator: InfixOperator;
	readonly left: Exp;
	readonly right: Exp;
};

export const InfixExp = Schema.TaggedStruct("InfixExp", {
	token: tokenSchema,
	operator: infixOperatorSchema,
	left: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	right: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
});

export const OpInfixExp = (op: InfixOperator) => (left: Exp, right: Exp) =>
	InfixExp.make({
		token: {
			_tag: op,
			literal: op,
		},
		operator: op,
		left,
		right,
	});

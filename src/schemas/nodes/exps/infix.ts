import { Schema } from "effect";
import {
	type InfixOperator,
	infixOperatorSchema,
} from "src/schemas/infix-operator";
import { type Token, tokenSchema } from "src/schemas/token/unions/all";
import type { INode } from "../interfaces/internal-node";
import { type Exp, type ExpEncoded, expSchema } from "./union";

export type InfixExpEncoded = {
	readonly _tag: "InfixExp";
	readonly token: Token;
	readonly operator: InfixOperator;
	readonly left: ExpEncoded;
	readonly right: ExpEncoded;
};

export class InfixExp
	extends Schema.TaggedClass<InfixExp>()("InfixExp", {
		token: tokenSchema,
		operator: infixOperatorSchema,
		left: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
		right: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	})
	implements INode
{
	string() {
		const t: string = `(${this.left.string()} ${this.operator} ${this.right.string()})`;
		return t;
	}
}

export const OpInfixExp = (op: InfixOperator) => (left: Exp, right: Exp) =>
	new InfixExp({
		token: {
			_tag: op,
			literal: op,
		},
		operator: op,
		left,
		right,
	});

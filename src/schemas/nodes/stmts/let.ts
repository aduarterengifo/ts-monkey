import { Schema } from "effect";
import { type LetToken, letTokenSchema } from "../../../schemas/token/let";
import { IdentExp, type IdentExpEncoded } from "../exps/ident";
import { type Exp, type ExpEncoded, expSchema } from "../exps/union";
import type { INode } from "../interfaces/internal-node";

export type LetStmtEncoded = {
	readonly _tag: "LetStmt";
	readonly name: IdentExpEncoded;
	readonly token: LetToken;
	readonly value: ExpEncoded;
};

export class LetStmt
	extends Schema.TaggedClass<LetStmt>()("LetStmt", {
		name: Schema.suspend(
			(): Schema.Schema<IdentExp, IdentExpEncoded> => IdentExp,
		),
		token: letTokenSchema,
		value: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	})
	implements INode
{
	string() {
		return `${this.token.literal} ${this.name.string()} = ${this.value.string()};`;
	}
}

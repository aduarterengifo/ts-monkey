import { Schema } from "effect";
import { type Token, tokenSchema } from "../../../schemas/token/unions/all";
import { type Exp, type ExpEncoded, expSchema } from "../exps/union";
import type { INode } from "../interfaces/internal-node";

export type ExpStmtEncoded = {
	readonly _tag: "ExpStmt";
	readonly token: Token;
	readonly expression: ExpEncoded;
};

export class ExpStmt
	extends Schema.TaggedClass<ExpStmt>()("ExpStmt", {
		token: tokenSchema,
		expression: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	})
	implements INode {}

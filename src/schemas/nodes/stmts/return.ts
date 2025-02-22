import { Schema } from "effect";
import { type Token, tokenSchema } from "../../../schemas/token/unions/all";
import { type Exp, type ExpEncoded, expSchema } from "../exps/union";
import type { INode } from "../interfaces/internal-node";

export type ReturnStmtEncoded = {
	readonly _tag: "ReturnStmt";
	readonly token: Token;
	readonly value: ExpEncoded;
};

export class ReturnStmt
	extends Schema.TaggedClass<ReturnStmt>()("ReturnStmt", {
		token: tokenSchema,
		value: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	})
	implements INode {}

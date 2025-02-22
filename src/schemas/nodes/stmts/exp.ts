import { Schema } from "effect";
import { type Token, tokenSchema } from "../../../schemas/token/unions/all";
import { type Exp, type ExpEncoded, expSchema } from "../exps/union";

export type ExpStmtEncoded = {
	readonly _tag: "ExpStmt";
	readonly token: Token;
	readonly expression: ExpEncoded;
};

export type ExpStmt = {
	readonly _tag: "ExpStmt";
	readonly token: Token;
	readonly expression: ExpEncoded;
};

export const ExpStmt = Schema.TaggedStruct("ExpStmt", {
	token: tokenSchema,
	expression: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
});

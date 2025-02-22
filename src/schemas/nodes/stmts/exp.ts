import { Schema } from "effect";
import { type Token, tokenSchema } from "../../../schemas/token/unions/all";
import { type Exp, expSchema } from "../exps/union";

export type ExpStmt = {
	readonly _tag: "ExpStmt";
	readonly token: Token;
	readonly expression: Exp;
};

export const ExpStmt = Schema.TaggedStruct("ExpStmt", {
	token: tokenSchema,
	expression: Schema.suspend((): Schema.Schema<Exp> => expSchema),
});

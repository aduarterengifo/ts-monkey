import { Schema } from "effect";
import { type Token, tokenSchema } from "../../../schemas/token/unions/all";
import { Exp } from "../exps/union";

export type ReturnStmt = {
	readonly _tag: "ReturnStmt";
	readonly token: Token;
	readonly value: Exp;
};

export const ReturnStmt = Schema.TaggedStruct("ReturnStmt", {
	token: tokenSchema,
	value: Schema.suspend((): Schema.Schema<Exp> => Exp),
});

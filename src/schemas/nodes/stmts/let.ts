import { Schema } from "effect";
import { type LetToken, letTokenSchema } from "../../../schemas/token/let";
import { IdentExp, type IdentExpEncoded } from "../exps/ident";
import { type Exp, type ExpEncoded, expSchema } from "../exps/union";

export type LetStmtEncoded = {
	readonly _tag: "LetStmt";
	readonly name: IdentExpEncoded;
	readonly token: LetToken;
	readonly value: ExpEncoded;
};

export type LetStmt = {
	readonly _tag: "LetStmt";
	readonly name: IdentExpEncoded;
	readonly token: LetToken;
	readonly value: ExpEncoded;
};

export const LetStmt = Schema.TaggedStruct("LetStmt", {
	name: Schema.suspend(
		(): Schema.Schema<IdentExp, IdentExpEncoded> => IdentExp,
	),
	token: letTokenSchema,
	value: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
});

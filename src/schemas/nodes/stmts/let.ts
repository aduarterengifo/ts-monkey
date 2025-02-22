import { Schema } from "effect";
import { type LetToken, letTokenSchema } from "../../../schemas/token/let";
import { IdentExp } from "../exps/ident";
import { type Exp, expSchema } from "../exps/union";
export type LetStmt = {
	readonly _tag: "LetStmt";
	readonly name: IdentExp;
	readonly token: LetToken;
	readonly value: Exp;
};

export const LetStmt = Schema.TaggedStruct("LetStmt", {
	name: Schema.suspend((): Schema.Schema<IdentExp> => IdentExp),
	token: letTokenSchema,
	value: Schema.suspend((): Schema.Schema<Exp> => expSchema),
});

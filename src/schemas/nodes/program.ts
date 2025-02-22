import { Schema } from "effect";
import { type Token, tokenSchema } from "../token/unions/all";
import { type Stmt, stmtSchema } from "./stmts/union";

export type Program = {
	readonly _tag: "Program";
	readonly token: Token;
	statements: Stmt[];
};

export const Program = Schema.TaggedStruct("Program", {
	token: tokenSchema,
	statements: Schema.Array(
		Schema.suspend((): Schema.Schema<Stmt> => stmtSchema),
	),
});

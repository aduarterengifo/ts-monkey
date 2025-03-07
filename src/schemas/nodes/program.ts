import { Schema } from "effect";
import { type Token, tokenSchema } from "../token/unions/all";
import { Stmt } from "./stmts/union";

export type Program = {
	readonly _tag: "Program";
	readonly token: Token;
	statements: readonly Stmt[];
};

export const Program = Schema.TaggedStruct("Program", {
	token: tokenSchema,
	statements: Schema.Array(Schema.suspend((): Schema.Schema<Stmt> => Stmt)),
});

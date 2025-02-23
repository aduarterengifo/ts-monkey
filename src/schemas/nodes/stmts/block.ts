import { Schema } from "effect";
import { type Token, tokenSchema } from "../../../schemas/token/unions/all";
import { Stmt } from "./union";

export type BlockStmt = {
	readonly _tag: "BlockStmt";
	readonly token: Token;
	statements: readonly Stmt[];
};

export const BlockStmt = Schema.TaggedStruct("BlockStmt", {
	token: tokenSchema,
	statements: Schema.Array(Schema.suspend((): Schema.Schema<Stmt> => Stmt)),
});

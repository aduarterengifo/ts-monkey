import { Schema } from "effect";
import { type Token, tokenSchema } from "../token/unions/all";
import type { INode } from "./interfaces/internal-node";
import { type Stmt, type StmtEncoded, stmtSchema } from "./stmts/union";

export type ReturnStmtEncoded = {
	readonly _tag: "ReturnStmt";
	readonly token: Token;
	statements: StmtEncoded[];
};

export class Program
	extends Schema.TaggedClass<Program>()("Program", {
		token: tokenSchema,
		statements: Schema.Array(
			Schema.suspend((): Schema.Schema<Stmt, StmtEncoded> => stmtSchema),
		),
	})
	implements INode {}

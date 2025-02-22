import { Schema } from "effect";
import { type IfToken, ifTokenSchema } from "src/schemas/token/if";
import { BlockStmt, type BlockStmtEncoded } from "../stmts/block";
import { type Exp, type ExpEncoded, expSchema } from "./union";

export type IfExpEncoded = {
	readonly _tag: "IfExp";
	readonly token: IfToken;
	readonly condition: ExpEncoded;
	readonly consequence: BlockStmtEncoded;
	readonly alternative?: BlockStmtEncoded | undefined;
};

export type IfExp = {
	readonly _tag: "IfExp";
	readonly token: IfToken;
	readonly condition: Exp;
	readonly consequence: BlockStmt;
	readonly alternative?: BlockStmt | undefined;
};

export const IfExp = Schema.TaggedStruct("IfExp", {
	token: ifTokenSchema,
	condition: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
	consequence: BlockStmt,
	alternative: Schema.optional(BlockStmt),
});

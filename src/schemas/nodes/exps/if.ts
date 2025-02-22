import { Schema } from "effect";
import { type IfToken, ifTokenSchema } from "src/schemas/token/if";
import { BlockStmt } from "../stmts/block";
import { type Exp, expSchema } from "./union";

export type IfExp = {
	readonly _tag: "IfExp";
	readonly token: IfToken;
	readonly condition: Exp;
	readonly consequence: BlockStmt;
	readonly alternative?: BlockStmt | undefined;
};

export const IfExp = Schema.TaggedStruct("IfExp", {
	token: ifTokenSchema,
	condition: Schema.suspend((): Schema.Schema<Exp> => expSchema),
	consequence: BlockStmt,
	alternative: Schema.optional(BlockStmt),
});

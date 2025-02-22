import { Schema } from "effect";
import { type IfToken, ifTokenSchema } from "src/schemas/token/if";
import { BlockStmt } from "../stmts/block";
import { Exp } from "./union";

export type IfExp = {
	readonly _tag: "IfExp";
	readonly token: IfToken;
	readonly condition: Exp;
	readonly consequence: BlockStmt;
	readonly alternative?: BlockStmt | undefined;
};

export const IfExp = Schema.TaggedStruct("IfExp", {
	token: ifTokenSchema,
	condition: Schema.suspend((): Schema.Schema<Exp> => Exp),
	consequence: BlockStmt,
	alternative: Schema.optional(BlockStmt),
});

import { Schema } from "effect";
import {
	type FnToken,
	fnTokenSchema,
} from "src/schemas/token/function-literal";
import { BlockStmt, type BlockStmtEncoded } from "../stmts/block";
import { IdentExp, type IdentExpEncoded } from "./ident";

export type FuncExpEncoded = {
	readonly _tag: "FuncExp";
	readonly token: FnToken;
	parameters: readonly IdentExpEncoded[];
	readonly body: BlockStmtEncoded;
};

export type FuncExp = {
	readonly _tag: "FuncExp";
	readonly token: FnToken;
	parameters: readonly IdentExp[];
	readonly body: BlockStmt;
};

export const FuncExp = Schema.TaggedStruct("FuncExp", {
	token: fnTokenSchema,
	parameters: Schema.Array(
		Schema.suspend((): Schema.Schema<IdentExp, IdentExpEncoded> => IdentExp),
	),
	body: BlockStmt,
});

import { Schema } from "effect";
import {
	type FnToken,
	fnTokenSchema,
} from "src/schemas/token/function-literal";
import { BlockStmt } from "../stmts/block";
import { IdentExp } from "./ident";

export type FuncExp = {
	readonly _tag: "FuncExp";
	readonly token: FnToken;
	parameters: readonly IdentExp[];
	readonly body: BlockStmt;
};

export const FuncExp = Schema.TaggedStruct("FuncExp", {
	token: fnTokenSchema,
	parameters: Schema.Array(
		Schema.suspend((): Schema.Schema<IdentExp> => IdentExp),
	),
	body: BlockStmt,
});

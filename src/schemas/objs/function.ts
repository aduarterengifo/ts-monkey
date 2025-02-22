import { Schema } from "effect";
import { IdentExp } from "../nodes/exps/ident";
import { BlockStmt } from "../nodes/stmts/block";

const fields = {
	env: Schema.Unknown,
};

export interface FunctionObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: "FunctionObj";
	readonly params: readonly IdentExp[];
	readonly body: BlockStmt;
}

export const FunctionObj = Schema.TaggedStruct("FunctionObj", {
	...fields,
	params: Schema.Array(Schema.suspend((): Schema.Schema<IdentExp> => IdentExp)),
	body: Schema.suspend((): Schema.Schema<BlockStmt> => BlockStmt),
});

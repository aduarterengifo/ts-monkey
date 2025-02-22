import { Schema } from "effect";
import { IdentExp } from "../nodes/exps/ident";
import { BlockStmt } from "../nodes/stmts/block";

const fields = {
	env: Schema.Unknown,
};

export interface DiffFunctionObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: "DiffFunctionObj";
	readonly params: readonly IdentExp[];
	readonly body: BlockStmt;
}

export const DiffFunctionObj = Schema.TaggedStruct("DiffFunctionObj", {
	...fields,
	params: Schema.Array(Schema.suspend((): Schema.Schema<IdentExp> => IdentExp)),
	body: Schema.suspend((): Schema.Schema<BlockStmt> => BlockStmt),
});

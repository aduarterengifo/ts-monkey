import {
	Environment,
	type EnvironmentEncoded,
} from "@/services/object/environment";
import { Schema } from "effect";
import { IdentExp } from "../nodes/exps/ident";
import { BlockStmt } from "../nodes/stmts/block";

export interface FunctionObj {
	readonly _tag: "FunctionObj";
	readonly env: Environment;
	readonly params: readonly IdentExp[];
	readonly body: BlockStmt;
}

export interface FunctionObjEncoded {
	readonly _tag: "FunctionObj";
	readonly env: EnvironmentEncoded;
	readonly params: readonly IdentExp[];
	readonly body: BlockStmt;
}

export const FunctionObj = Schema.TaggedStruct("FunctionObj", {
	env: Environment,
	params: Schema.Array(Schema.suspend((): Schema.Schema<IdentExp> => IdentExp)),
	body: Schema.suspend((): Schema.Schema<BlockStmt> => BlockStmt),
});

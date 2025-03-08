// TODO: call exp for soft eval of trig functions.

import { Schema } from "effect";
import type { BuiltInFunc } from "../built-in";
import { Exp } from "../nodes/exps/union";
import { BuiltInObj } from "./built-in";
import { FunctionObj, type FunctionObjEncoded } from "./function";

export interface CallObj {
	readonly _tag: "CallObj";
	readonly fn: FunctionObj | BuiltInObj;
	readonly args: readonly Exp[];
}

export interface CallObjEncoded {
	readonly _tag: "CallObj";
	readonly fn: FunctionObjEncoded | BuiltInObj;
	readonly args: readonly Exp[];
}

export const CallObj = Schema.TaggedStruct("CallObj", {
	fn: Schema.suspend(
		(): Schema.Schema<
			FunctionObj | BuiltInObj,
			FunctionObjEncoded | BuiltInObj
		> => Schema.Union(FunctionObj, BuiltInObj),
	),
	args: Schema.Array(Schema.suspend((): Schema.Schema<Exp> => Exp)),
});

export const BuiltInCallObj = (fn: BuiltInFunc) => (args: readonly Exp[]) =>
	CallObj.make({
		fn: BuiltInObj.make({ fn }),
		args,
	});

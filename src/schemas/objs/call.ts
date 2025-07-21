// TODO: call exp for soft eval of trig functions.

import { Schema } from "effect";
import type { BuiltInFunc } from "../built-in";
import type { Exp } from "../nodes/exps/union";
import { BuiltInObj } from "./built-in";
import { FunctionObj, type FunctionObjEncoded } from "./function";
import { Obj, type ObjEncoded } from "./union";

export interface CallObj {
	readonly _tag: "CallObj";
	readonly fn: FunctionObj | BuiltInObj;
	readonly args: readonly Obj[];
}

export interface CallObjEncoded {
	readonly _tag: "CallObj";
	readonly fn: FunctionObjEncoded | BuiltInObj;
	readonly args: readonly ObjEncoded[];
}

export const CallObj = Schema.TaggedStruct("CallObj", {
	fn: Schema.suspend(
		(): Schema.Schema<
			FunctionObj | BuiltInObj,
			FunctionObjEncoded | BuiltInObj
		> => Schema.Union(FunctionObj, BuiltInObj),
	),
	args: Schema.Array(Schema.suspend((): Schema.Schema<Obj, ObjEncoded> => Obj)),
});

export const BuiltInCallObj = (fn: BuiltInFunc) => (args: readonly Obj[]) =>
	CallObj.make({
		fn: BuiltInObj.make({ fn }),
		args,
	});

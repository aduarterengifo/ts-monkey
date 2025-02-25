import { Schema } from "effect";
import { Obj, type ObjEncoded } from "./union";

export interface ArrayObj {
	readonly _tag: "ArrayObj";
	readonly elements: readonly Obj[];
}

export interface ArrayObjEncoded {
	readonly _tag: "ArrayObj";
	readonly elements: readonly ObjEncoded[];
}

export const ArrayObj = Schema.TaggedStruct("ArrayObj", {
	elements: Schema.Array(
		Schema.suspend((): Schema.Schema<Obj, ObjEncoded> => Obj),
	),
});

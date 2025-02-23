import { Schema } from "effect";
import { Obj, type ObjEncoded } from "./union";

export interface ReturnObj {
	readonly _tag: "ReturnObj";
	readonly value: Obj;
}
export interface ReturnObjEncoded {
	readonly _tag: "ReturnObj";
	readonly value: ObjEncoded;
}

export const ReturnObj = Schema.TaggedStruct("ReturnObj", {
	value: Schema.suspend((): Schema.Schema<Obj, ObjEncoded> => Obj),
});

//export type ReturnObj = typeof returnObjSchema.Type

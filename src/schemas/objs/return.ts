import { Schema } from "effect";
import { Obj } from "./union";

export interface ReturnObj {
	readonly _tag: "ReturnObj";
	readonly value: Obj;
}

export const ReturnObj = Schema.TaggedStruct("ReturnObj", {
	value: Schema.suspend((): Schema.Schema<Obj> => Obj),
});

//export type ReturnObj = typeof returnObjSchema.Type

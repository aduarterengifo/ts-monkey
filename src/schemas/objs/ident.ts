import { Schema } from "effect";
import { IdentExp } from "../nodes/exps/ident";

export interface IdentObj {
	readonly _tag: "IdentObj";
	readonly identExp: IdentExp;
}

export const IdentObj = Schema.TaggedStruct("IdentObj", {
	identExp: Schema.suspend((): Schema.Schema<IdentExp> => IdentExp),
});

export const identObjEq = Schema.equivalence(IdentObj);

import { Schema } from "effect";

const fields = {
	value: Schema.Number,
};

export interface IntegerObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: "IntegerObj";
}

export const IntegerObj = Schema.TaggedStruct("IntegerObj", {
	...fields,
});

export const intObjEq = Schema.equivalence(IntegerObj);

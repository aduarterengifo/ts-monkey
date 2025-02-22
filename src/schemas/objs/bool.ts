import { Schema } from "effect";

const fields = {
	value: Schema.Boolean,
};

export interface BooleanObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: "BooleanObj";
}

export const BooleanObj = Schema.TaggedStruct("BooleanObj", {
	...fields,
});

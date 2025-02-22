import { Schema } from "effect";

const fields = {
	inpect: Schema.String,
};

export interface NullObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: "NullObj";
}

export const NullObj = Schema.TaggedStruct("NullObj", {
	...fields,
});

import { Schema } from "effect";

const fields = {
	vlue: Schema.String,
};

export interface StringObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: "StringObj";
}

export const StringObj = Schema.TaggedStruct("StringObj", {
	...fields,
});

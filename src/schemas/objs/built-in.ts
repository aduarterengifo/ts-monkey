import { Schema } from "effect";

const fields = {
	fn: Schema.Literal(
		"len",
		"diff",
		"sin",
		"cos",
		"tan",
		"ln",
		"exp",
		"pi",
		"e",
	), //repeated
};

export interface BuiltInObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: "BuiltInObj";
}

export const BuiltInObj = Schema.TaggedStruct("BuiltInObj", {
	...fields,
});

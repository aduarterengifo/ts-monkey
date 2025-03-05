import { Schema } from "effect";
import { BuiltInFunc } from "../built-in";
import { BuiltInDiffFunc } from "../built-in/diff";

const fields = {
	fn: BuiltInFunc, //repeated
};

export interface BuiltInObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: "BuiltInObj";
}

export const BuiltInObj = Schema.TaggedStruct("BuiltInObj", {
	...fields,
});

// Define fields for the stricter variant
const diffFields = {
	fn: BuiltInDiffFunc,
};

// Create the interface for the stricter variant
export interface BuiltInDiffObj extends Schema.Struct.Type<typeof diffFields> {
	readonly _tag: "BuiltInObj";
}

// Create the schema for the stricter variant
export const BuiltInDiffObj = Schema.TaggedStruct("BuiltInObj", {
	...diffFields,
});

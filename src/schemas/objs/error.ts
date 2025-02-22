import { Schema } from "effect";

const fields = {
	message: Schema.String,
};

export interface ErrorObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: "ErrorObj";
}

export const ErrorObj = Schema.TaggedStruct("ErrorObj", {
	...fields,
});

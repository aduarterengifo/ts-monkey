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

export const FALSE = BooleanObj.make({ value: false });
export const TRUE = BooleanObj.make({ value: true });

export const nativeBoolToObjectBool = (input: boolean) =>
	input ? TRUE : FALSE;

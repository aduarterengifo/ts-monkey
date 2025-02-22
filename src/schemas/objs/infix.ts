import { Schema } from "effect";
import { infixOperatorSchema } from "../infix-operator";
import { Obj } from "./union";

const fields = {
	operator: infixOperatorSchema,
};

export interface InfixObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: "InfixObj";
	readonly left: Obj;
	readonly right: Obj;
}

export const InfixObj = Schema.TaggedStruct("InfixObj", {
	...fields,
	left: Schema.suspend((): Schema.Schema<Obj> => Obj),
	right: Schema.suspend((): Schema.Schema<Obj> => Obj),
	operator: infixOperatorSchema,
});

export const infixObjEq = Schema.equivalence(InfixObj);

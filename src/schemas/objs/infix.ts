import { Schema } from "effect";
import { type InfixOperator, infixOperatorSchema } from "../infix-operator";
import { TokenType } from "../token-types/union";
import { Obj, type ObjEncoded } from "./union";

const fields = {
	operator: infixOperatorSchema,
};

export interface InfixObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: "InfixObj";
	readonly left: Obj;
	readonly right: Obj;
}

export interface InfixObjEncoded extends Schema.Struct.Type<typeof fields> {
	readonly _tag: "InfixObj";
	readonly left: ObjEncoded;
	readonly right: ObjEncoded;
}

export const InfixObj = Schema.TaggedStruct("InfixObj", {
	...fields,
	left: Schema.suspend((): Schema.Schema<Obj, ObjEncoded> => Obj),
	right: Schema.suspend((): Schema.Schema<Obj, ObjEncoded> => Obj),
	operator: infixOperatorSchema,
});

export const infixObjEq = Schema.equivalence(InfixObj);

export const OpInfixObj = (op: InfixOperator) => (left: Obj, right: Obj) =>
	InfixObj.make({
		operator: op,
		left,
		right,
	});

export const asteriskInfixObj = OpInfixObj(TokenType.ASTERISK);
export const exponentInfixObj = OpInfixObj(TokenType.EXPONENT);

import { type PolynomialObj, diffPolynomial } from "@/services/diff/obj";
import { Effect, Schema } from "effect";
import { type InfixOperator, infixOperatorSchema } from "../infix-operator";
import type { IdentExp } from "../nodes/exps/ident";
import { TokenType } from "../token-types/union";
import type { IdentObj } from "./ident";
import { IntegerObj } from "./int";
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

export const OpInfixObj = (op: InfixOperator) => (left: Obj, right: Obj) =>
	InfixObj.make({
		operator: op,
		left,
		right,
	});

export const asteriskInfixObj = OpInfixObj(TokenType.ASTERISK);
export const exponentInfixObj = OpInfixObj(TokenType.EXPONENT);

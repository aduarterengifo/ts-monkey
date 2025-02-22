import { nodeString } from "@/schemas/nodes/union";
import type { Obj } from "@/schemas/objs/union";
import { Data, Match } from "effect";

const { $is, $match } = Data.taggedEnum<Obj>();

export const isIntegerObj = $is("IntegerObj");
export const isBooleanObj = $is("BooleanObj");
export const isNullObj = $is("NullObj");
export const isReturnObj = $is("ReturnObj");
export const isErrorObj = $is("ErrorObj");
export const isFunctionObj = $is("FunctionObj");
export const isStringObj = $is("StringObj");
export const isBuiltInObj = $is("BuiltInObj");
export const isIdentObj = $is("IdentObj");
export const isInfixObj = $is("InfixObj");

export const objMatch = $match;

export const objInspect = (obj: Obj): string =>
	Match.value(obj).pipe(
		Match.tag("InfixObj", () => "infix obj"),
		Match.tag("IdentObj", ({ identExp: { value } }) => value),
		Match.tag("BuiltInObj", () => "builtin function"),
		Match.tag(
			"FunctionObj",
			({ params, body }) => `
			fn (${params.map((p) => nodeString(p)).join(", ")}) { 
			${nodeString(body)}
			}
			`,
		),
		Match.tag("ErrorObj", (errorObj) => `ERROR: ${errorObj.message}`),
		Match.tag("ReturnObj", ({ value }) => objInspect(value)),
		Match.tag("NullObj", () => "null"),
		Match.tag("BooleanObj", ({ value }) => `${value}`),
		Match.tag("IntegerObj", ({ value }) => `${value}`),
		Match.tag("StringObj", ({ value }) => value),
		Match.exhaustive,
	);

import { nodeString } from "@/schemas/nodes/union";
import { BooleanObj } from "@/schemas/objs/bool";
import { BuiltInObj } from "@/schemas/objs/built-in";
import { ErrorObj } from "@/schemas/objs/error";
import { FunctionObj } from "@/schemas/objs/function";
import { IdentObj } from "@/schemas/objs/ident";
import { InfixObj } from "@/schemas/objs/infix";
import { IntegerObj } from "@/schemas/objs/int";
import { NullObj } from "@/schemas/objs/null";
import { ReturnObj } from "@/schemas/objs/return";
import { StringObj } from "@/schemas/objs/string";
import type { Obj } from "@/schemas/objs/union";
import { Data, type Effect, Match } from "effect";
import type { ParseError } from "effect/ParseResult";
import type { KennethParseError } from "src/errors/kenneth/parse";
import type { InfixOperator } from "src/schemas/infix-operator";
import type { IdentExp } from "src/schemas/nodes/exps/ident";
import type { BlockStmt } from "src/schemas/nodes/stmts/block";
import type { Environment } from "./environment";

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

export const createIntegerObj = (value: number) =>
	IntegerObj.make({
		value,
	});

const createBooleanObj = (value: boolean) =>
	BooleanObj.make({
		value,
	});

export const FALSE = createBooleanObj(false);
export const TRUE = createBooleanObj(true);

export const nativeBoolToObjectBool = (input: boolean) =>
	input ? TRUE : FALSE;

export const createReturnObj = (value: Obj) => ReturnObj.make({ value });

export const createErrorObj = (message: string) =>
	ErrorObj.make({
		message,
	});

export const createFunctionObj = (
	params: readonly IdentExp[],
	body: BlockStmt,
	env: Environment,
) =>
	FunctionObj.make({
		params,
		body,
		env,
	});

export const createStringObj = (value: string) =>
	StringObj.make({
		value,
	});

export const createBuiltInObj = (
	fn: (
		...args: Obj[]
	) => Effect.Effect<Obj, KennethParseError | ParseError | never, never>,
) =>
	BuiltInObj.make({
		fn,
	});

export const createIdentObj = (identExp: IdentExp) =>
	IdentObj.make({
		identExp,
	});

export const createInfixObj = (
	left: Obj,
	operator: InfixOperator,
	right: Obj,
) =>
	InfixObj.make({
		left,
		operator,
		right,
	});

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

import { nodeString } from "@/schemas/nodes/union";
import type { Obj } from "@/schemas/objs/union";
import { Data, type Effect, Match } from "effect";
import type { ParseError } from "effect/ParseResult";
import type { KennethParseError } from "src/errors/kenneth/parse";
import type { InfixOperator } from "src/schemas/infix-operator";
import type { IdentExp } from "src/schemas/nodes/exps/ident";
import type { BlockStmt } from "src/schemas/nodes/stmts/block";
import type { Environment } from "./environment";

export type IntegerObj = Extract<Obj, { _tag: "IntegerObj" }>;
export type BooleanObj = Extract<Obj, { _tag: "BooleanObj" }>;
export type NullObj = Extract<Obj, { _tag: "NullObj" }>;
export type ReturnObj = Extract<Obj, { _tag: "ReturnObj" }>;
export type ErrorObj = Extract<Obj, { _tag: "ErrorObj" }>;
export type FunctionObj = Extract<Obj, { _tag: "FunctionObj" }>;
export type StringObj = Extract<Obj, { _tag: "StringObj" }>;
export type BuiltInObj = Extract<Obj, { _tag: "BuiltInObj" }>;
export type IdentObj = Extract<Obj, { _tag: "IdentObj" }>;
export type InfixObj = Extract<Obj, { _tag: "InfixObj" }>;

const {
	$is,
	$match,
	IntegerObj,
	BooleanObj,
	NullObj,
	ReturnObj,
	ErrorObj,
	FunctionObj,
	StringObj,
	BuiltInObj,
	IdentObj,
	InfixObj,
} = Data.taggedEnum<Obj>();

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
	IntegerObj({
		value,
	});

const createBooleanObj = (value: boolean) =>
	BooleanObj({
		value,
	});

export const FALSE = createBooleanObj(false);
export const TRUE = createBooleanObj(true);

export const nativeBoolToObjectBool = (input: boolean) =>
	input ? TRUE : FALSE;

const createNullObj = () => NullObj();

export const NULL = createNullObj();

export const createReturnObj = (value: Obj) => ReturnObj({ value });

export const createErrorObj = (message: string) =>
	ErrorObj({
		message,
	});

export const createFunctionObj = (
	params: readonly IdentExp[],
	body: BlockStmt,
	env: Environment,
) =>
	FunctionObj({
		params,
		body,
		env,
	});

export const createStringObj = (value: string) =>
	StringObj({
		value,
	});

export const createBuiltInObj = (
	fn: (
		...args: Obj[]
	) => Effect.Effect<Obj, KennethParseError | ParseError | never, never>,
) =>
	BuiltInObj({
		fn,
	});

export const createIdentObj = (identExp: IdentExp) =>
	IdentObj({
		identExp,
	});

export const createInfixObj = (
	left: Obj,
	operator: InfixOperator,
	right: Obj,
) =>
	InfixObj({
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

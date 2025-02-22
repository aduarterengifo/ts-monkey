import { Data, Match, Schema } from "effect";
import { BoolExp, nativeToBoolExp } from "./boolean";
import { CallExp } from "./call";
import { DiffExp } from "./diff";
import { FuncExp } from "./function";
import { IdentExp } from "./ident";
import { IfExp } from "./if";
import { InfixExp } from "./infix";
import { IntExp, nativeToIntExp } from "./int";
import { PrefixExp } from "./prefix";
import { StrExp, nativeToStrExp } from "./str";

export type Exp =
	| BoolExp
	| CallExp
	| FuncExp
	| IdentExp
	| IfExp
	| InfixExp
	| IntExp
	| PrefixExp
	| StrExp
	| DiffExp;

export const Exp = Schema.suspend(
	(): Schema.Schema<Exp> =>
		Schema.Union(
			BoolExp,
			CallExp,
			FuncExp,
			IdentExp,
			IfExp,
			InfixExp,
			IntExp,
			PrefixExp,
			StrExp,
			DiffExp,
		),
);

export const { $is: isExp, $match: matchExp } = Data.taggedEnum<Exp>();

export const isBoolExp = isExp("BoolExp");
export const isCallExp = isExp("CallExp");
export const isFuncExp = isExp("FuncExp");
export const isIdentExp = isExp("IdentExp");
export const isIfExp = isExp("IfExp");
export const isInfixExp = isExp("InfixExp");
export const isIntExp = isExp("IntExp");
export const isPrefixExp = isExp("PrefixExp");
export const isStrExp = isExp("StrExp");

type NativeToExpReturn<T> = T extends boolean
	? BoolExp
	: T extends number
		? IntExp
		: T extends string
			? StrExp
			: never;

function nativeToExpImpl(
	native: number | boolean | string,
): BoolExp | IntExp | StrExp {
	return Match.value(native).pipe(
		Match.when(Match.boolean, (bool) => nativeToBoolExp(bool)),
		Match.when(Match.number, (num) => nativeToIntExp(num)),
		Match.when(Match.string, (str) => nativeToStrExp(str)),
		Match.exhaustive,
	);
}

export function nativeToExp<T extends number | boolean | string>(
	native: T,
): NativeToExpReturn<T> {
	return nativeToExpImpl(native) as NativeToExpReturn<T>;
}

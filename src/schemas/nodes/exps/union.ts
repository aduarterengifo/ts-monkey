import { Data, Match, Schema } from 'effect'
import { BoolExp, nativeToBoolExp, type BoolExpEncoded } from './boolean'
import { PrefixExp, type PrefixExpEncoded } from './prefix'
import { InfixExp, type InfixExpEncoded } from './infix'
import { IntExp, nativeToIntExp, type IntExpEncoded } from './int'
import { CallExp, type CallExpEncoded } from './call'
import { FuncExp, type FuncExpEncoded } from './function'
import { IdentExp, type IdentExpEncoded } from './ident'
import { IfExp, type IfExpEncoded } from './if'
import { nativeToStrExp, StrExp, type StrExpEncoded } from './str'
import { DiffExp, type DiffExpEncoded } from './diff'

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
	| DiffExp

export type ExpEncoded =
	| BoolExpEncoded
	| CallExpEncoded
	| FuncExpEncoded
	| IdentExpEncoded
	| IfExpEncoded
	| InfixExpEncoded
	| IntExpEncoded
	| PrefixExpEncoded
	| StrExpEncoded
	| DiffExpEncoded

export const expSchema = Schema.suspend(
	(): Schema.Schema<Exp, ExpEncoded> =>
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
)

export const { $is: isExp, $match: matchExp } = Data.taggedEnum<Exp>()

export const isBoolExp = isExp('BoolExp')
export const isCallExp = isExp('CallExp')
export const isFuncExp = isExp('FuncExp')
export const isIdentExp = isExp('IdentExp')
export const isIfExp = isExp('IfExp')
export const isInfixExp = isExp('InfixExp')
export const isIntExp = isExp('IntExp')
export const isPrefixExp = isExp('PrefixExp')
export const isStrExp = isExp('StrExp')

type NativeToExpReturn<T> = T extends boolean
	? BoolExp
	: T extends number
		? IntExp
		: T extends string
			? StrExp
			: never

function nativeToExpImpl(
	native: number | boolean | string,
): BoolExp | IntExp | StrExp {
	return Match.value(native).pipe(
		Match.when(Match.boolean, (bool) => nativeToBoolExp(bool)),
		Match.when(Match.number, (num) => nativeToIntExp(num)),
		Match.when(Match.string, (str) => nativeToStrExp(str)),
		Match.exhaustive,
	)
}

export function nativeToExp<T extends number | boolean | string>(
	native: T,
): NativeToExpReturn<T> {
	return nativeToExpImpl(native) as NativeToExpReturn<T>
}

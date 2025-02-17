import { Data, type Effect } from 'effect'
import type { Environment } from './environment'
import type { IdentExp } from 'src/schemas/nodes/exps/ident'
import type { BlockStmt } from 'src/schemas/nodes/stmts/block'
import type { KennethParseError } from 'src/errors/kenneth/parse'
import type { ParseError } from 'effect/ParseResult'
import type { InfixOperator } from 'src/schemas/infix-operator'
import type { InfixExp } from 'src/schemas/nodes/exps/infix'

export interface InternalObj {
	readonly inspect: () => string
}

export type Obj = Data.TaggedEnum<{
	IntegerObj: InternalObj & {
		readonly value: number
	}
	BooleanObj: InternalObj & { readonly value: boolean }
	NullObj: InternalObj
	ReturnObj: InternalObj & { readonly value: Obj }
	ErrorObj: InternalObj & { readonly message: string }
	FunctionObj: InternalObj & {
		readonly params: readonly IdentExp[]
		readonly body: BlockStmt
		readonly env: Environment
	}
	StringObj: InternalObj & {
		readonly value: string
	}
	BuiltInObj: InternalObj & {
		readonly fn: (
			...args: Obj[]
		) => Effect.Effect<Obj, KennethParseError | ParseError | never, never>
	}
	IdentObj: InternalObj & {
		readonly identExp: IdentExp
	}
	InfixObj: InternalObj & {
		readonly left: Obj
		readonly right: Obj
		readonly operator: InfixOperator
	}
}>

export type IntegerObj = Extract<Obj, { _tag: 'IntegerObj' }>
export type BooleanObj = Extract<Obj, { _tag: 'BooleanObj' }>
export type NullObj = Extract<Obj, { _tag: 'NullObj' }>
export type ReturnObj = Extract<Obj, { _tag: 'ReturnObj' }>
export type ErrorObj = Extract<Obj, { _tag: 'ErrorObj' }>
export type FunctionObj = Extract<Obj, { _tag: 'FunctionObj' }>
export type StringObj = Extract<Obj, { _tag: 'StringObj' }>
export type BuiltInObj = Extract<Obj, { _tag: 'BuiltInObj' }>
export type IdentObj = Extract<Obj, { _tag: 'IdentObj' }>
export type InfixObj = Extract<Obj, { _tag: 'InfixObj' }>

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
} = Data.taggedEnum<Obj>()

export const isIntegerObj = $is('IntegerObj')
export const isBooleanObj = $is('BooleanObj')
export const isNullObj = $is('NullObj')
export const isReturnObj = $is('ReturnObj')
export const isErrorObj = $is('ErrorObj')
export const isFunctionObj = $is('FunctionObj')
export const isStringObj = $is('StringObj')
export const isBuiltInObj = $is('BuiltInObj')
export const isIdentObj = $is('IdentObj')
export const isInfixObj = $is('InfixObj')

export const objMatch = $match

export const createIntegerObj = (value: number) =>
	IntegerObj({
		value,
		inspect: () => String(value),
	})

const createBooleanObj = (value: boolean) =>
	BooleanObj({
		value,
		inspect: () => String(value),
	})

export const FALSE = createBooleanObj(false)
export const TRUE = createBooleanObj(true)

export const nativeBoolToObjectBool = (input: boolean) => (input ? TRUE : FALSE)

const createNullObj = () =>
	NullObj({
		inspect: () => 'null',
	})

export const NULL = createNullObj()

export const createReturnObj = (value: Obj) =>
	ReturnObj({ value, inspect: value.inspect })

export const createErrorObj = (message: string) =>
	ErrorObj({
		message,
		inspect: () => `ERROR: ${message}`,
	})

export const createFunctionObj = (
	params: readonly IdentExp[],
	body: BlockStmt,
	env: Environment,
) =>
	FunctionObj({
		params,
		body,
		env,
		inspect: () => `
		fn (${params.map((p) => p.string()).join(', ')}) { 
		${body.string()}
		}
		`,
	})

export const createStringObj = (value: string) =>
	StringObj({
		value,
		inspect: () => value,
	})

export const createBuiltInObj = (
	fn: (
		...args: Obj[]
	) => Effect.Effect<Obj, KennethParseError | ParseError | never, never>,
) =>
	BuiltInObj({
		fn,
		inspect: () => 'builtin function',
	})

export const createIdentObj = (identExp: IdentExp) =>
	IdentObj({
		identExp,
		inspect: () => identExp.value,
	})

export const createInfixObj = (
	left: Obj,
	operator: InfixOperator,
	right: Obj,
) =>
	InfixObj({
		left,
		operator,
		right,
		inspect: () => 'infix obj',
	})

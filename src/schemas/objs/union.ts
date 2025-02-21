import { Data, Pretty, Schema } from 'effect'
import { type BoolObjEncoded, boolObjSchema, type BoolObj } from './bool'
import {
	type BuiltInObjEncoded,
	builtInObjSchema,
	type BuiltInObj,
} from './built-in'
import { type ErrorObjEncoded, errorObjSchema, type ErrorObj } from './error'
import {
	type FunctionObjEncoded,
	functionObjSchema,
	type FunctionObj,
} from './function'
import { type IntObjEncoded, intObjSchema, type IntObj } from './int'
import { type NullObjEncoded, nullObjSchema, type NullObj } from './null'
import {
	returnObjSchema,
	type ReturnObj,
	type ReturnObjEncoded,
} from './return'
import {
	type StringObjEncoded,
	stringObjSchema,
	type StringObj,
} from './string'
import { IdentObj, IdentObjEncoded, identObjSchema } from './ident'
import { InfixObj, InfixObjEncoded, infixObjSchema } from './infix'

export type Obj =
	| BoolObj
	| BuiltInObj
	| ErrorObj
	| FunctionObj
	| IntObj
	| NullObj
	| ReturnObj
	| StringObj
	| IdentObj
	| InfixObj

export type ObjEncoded =
	| BoolObjEncoded
	| BuiltInObjEncoded
	| ErrorObjEncoded
	| FunctionObjEncoded
	| IntObjEncoded
	| NullObjEncoded
	| ReturnObjEncoded
	| StringObjEncoded
	| IdentObjEncoded
	| InfixObjEncoded

export const objSchema = Schema.suspend(
	(): Schema.Schema<Obj, ObjEncoded> =>
		Schema.Union(
			boolObjSchema,
			builtInObjSchema,
			errorObjSchema,
			functionObjSchema,
			intObjSchema,
			nullObjSchema,
			returnObjSchema,
			stringObjSchema,
			identObjSchema,
			infixObjSchema
		),
)

export const prettyObj = Pretty.make(objSchema)

const {
	$is,
	$match,
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

export const isObj = $is

export const FALSE = boolObjSchema.make({value: false})
export const TRUE = boolObjSchema.make({value: true})

export const nativeBoolToObjectBool = (input: boolean) => (input ? TRUE : FALSE)
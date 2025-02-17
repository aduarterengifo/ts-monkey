import { Schema } from 'effect'
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

export type Obj =
	| BoolObj
	| BuiltInObj
	| ErrorObj
	| FunctionObj
	| IntObj
	| NullObj
	| ReturnObj
	| StringObj

export type ObjEncoded =
	| BoolObjEncoded
	| BuiltInObjEncoded
	| ErrorObjEncoded
	| FunctionObjEncoded
	| IntObjEncoded
	| NullObjEncoded
	| ReturnObjEncoded
	| StringObjEncoded

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
		),
)

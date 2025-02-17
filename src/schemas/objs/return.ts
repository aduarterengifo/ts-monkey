import { Schema } from 'effect'
import { type Obj, type ObjEncoded, objSchema } from './union'

export interface ReturnObj {
	readonly _tag: 'ReturnObj'
	readonly value: Obj
}

export interface ReturnObjEncoded {
	readonly _tag: 'ReturnObj'
	readonly value: ObjEncoded
}

export const returnObjSchema = Schema.TaggedStruct('ReturnObj', {
	value: Schema.suspend((): Schema.Schema<Obj, ObjEncoded> => objSchema),
})

//export type ReturnObj = typeof returnObjSchema.Type

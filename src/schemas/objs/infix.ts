import { Schema } from 'effect'
import { infixOperatorSchema } from '../infix-operator'
import { Obj, ObjEncoded, objSchema } from './union'

const fields = {
    operator: infixOperatorSchema
}

export interface InfixObj extends Schema.Struct.Type<typeof fields>  {
	readonly _tag: 'InfixObj'
    readonly left: Obj
    readonly right: Obj
}

export interface InfixObjEncoded extends Schema.Struct.Type<typeof fields>  {
	readonly _tag: 'InfixObj'
    readonly left: ObjEncoded
    readonly right: ObjEncoded
}

export const infixObjSchema = Schema.TaggedStruct('InfixObj', {
    ...fields,
    left: Schema.suspend((): Schema.Schema<Obj, ObjEncoded> => objSchema),
	right: Schema.suspend((): Schema.Schema<Obj, ObjEncoded> => objSchema),
    operator: infixOperatorSchema
})

export const infixObjEq = Schema.equivalence(infixObjSchema)

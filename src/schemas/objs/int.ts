import { Schema } from 'effect'

const fields = {
	value: Schema.Number,
}

export interface IntObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: 'IntegerObj'
}

export interface IntObjEncoded extends Schema.Struct.Type<typeof fields> {
	readonly _tag: 'IntegerObj'
}

export const intObjSchema = Schema.TaggedStruct('IntegerObj', {
	...fields,
})

export const intObjEq = Schema.equivalence(intObjSchema)

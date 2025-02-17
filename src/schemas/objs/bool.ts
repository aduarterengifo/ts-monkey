import { Schema } from 'effect'

const fields = {
	value: Schema.Boolean,
}

export interface BoolObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: 'BoolObj'
}

export interface BoolObjEncoded extends Schema.Struct.Type<typeof fields> {
	readonly _tag: 'BoolObj'
}

export const boolObjSchema = Schema.TaggedStruct('BoolObj', {
	...fields,
})

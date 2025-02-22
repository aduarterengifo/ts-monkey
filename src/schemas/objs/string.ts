import { Schema } from 'effect'

const fields = {
	value: Schema.String,
}

export interface StringObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: 'StringObj'
}

export interface StringObjEncoded extends Schema.Struct.Type<typeof fields> {
	readonly _tag: 'StringObj'
}

export const stringObjSchema = Schema.TaggedStruct('StringObj', {
	...fields,
})

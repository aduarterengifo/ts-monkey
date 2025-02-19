import { Schema } from 'effect'

const fields = {
	fn: Schema.Literal('len', 'diff'),
}

export interface BuiltInObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: 'BuiltInObj'
}

export interface BuiltInObjEncoded extends Schema.Struct.Type<typeof fields> {
	readonly _tag: 'BuiltInObj'
}

export const builtInObjSchema = Schema.TaggedStruct('BuiltInObj', {
	...fields,
})

import { Schema } from 'effect'

export interface NullObj {
	readonly _tag: 'NullObj'
}

export interface NullObjEncoded  {
	readonly _tag: 'NullObj'
}

export const nullObjSchema = Schema.TaggedStruct('NullObj', {
})

export const NULL = nullObjSchema.make()
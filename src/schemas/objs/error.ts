import { Schema } from 'effect'

const fields = {
	message: Schema.String,
}

export interface ErrorObj extends Schema.Struct.Type<typeof fields> {
	readonly _tag: 'ErrorObj'
}

export interface ErrorObjEncoded extends Schema.Struct.Type<typeof fields> {
	readonly _tag: 'ErrorObj'
}

export const errorObjSchema = Schema.TaggedStruct('ErrorObj', {
	...fields,
})

import { Schema } from 'effect'

import { tokenTypeSchema } from 'src/schemas/token-types/union'

export const tokenSchema = Schema.Struct({
	_tag: tokenTypeSchema,
	literal: Schema.Union(Schema.String, Schema.Number),
})

export type Token = typeof tokenSchema.Type

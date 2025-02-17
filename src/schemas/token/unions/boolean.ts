import { Schema } from 'effect'
import { falseTokenSchema } from '../false'
import { trueTokenSchema } from '../true'

export const boolTokenSchema = Schema.Union(trueTokenSchema, falseTokenSchema)

export type BoolToken = typeof boolTokenSchema.Type

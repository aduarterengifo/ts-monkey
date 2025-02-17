import { Schema } from 'effect'
import { bangTokenSchema } from '../bang'
import { minusTokenSchema } from '../minus'

export const prefixTokenSchema = Schema.Union(bangTokenSchema, minusTokenSchema)

export type PrefixToken = typeof prefixTokenSchema.Type

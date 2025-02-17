import { Schema } from 'effect'

import { finiteTokenTypeSchema, FiniteTokenType } from './finite'
import { infiniteTokenTypeSchema, InfiniteTokenType } from './infinite'

export const tokenTypeSchema = Schema.Union(
	finiteTokenTypeSchema,
	infiniteTokenTypeSchema,
)

export type TokenType = typeof tokenTypeSchema.Type

export const TokenType = { ...FiniteTokenType, ...InfiniteTokenType }

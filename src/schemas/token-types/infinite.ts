import { Schema } from 'effect'

export const InfiniteTokenType = {
	STRING: 'STRING',
	INT: 'INT',
	IDENT: 'IDENT',
} as const
export const infiniteTokenTypeSchema = Schema.Literal(
	...Object.values(InfiniteTokenType),
)

export type InfiniteTokenType = typeof infiniteTokenTypeSchema.Type

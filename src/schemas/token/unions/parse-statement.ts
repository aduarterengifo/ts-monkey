import { Schema } from 'effect'
import { letTokenSchema } from '../let'
import { returnTokenSchema } from '../return'

export const parseStatementTokenSchema = Schema.Union(
	letTokenSchema,
	returnTokenSchema,
)

export type ParseStatementToken = typeof parseStatementTokenSchema.Type

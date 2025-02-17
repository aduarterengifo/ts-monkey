import { Schema } from 'effect'
import { identTokenSchema } from '../../ident'
import { intTokenSchema } from '../../int'
import { ifTokenSchema } from '../../if'
import { fnTokenSchema } from '../../function-literal'
import { boolTokenSchema } from '../boolean'
import { prefixTokenSchema } from '../prefix'
import { stringTokenSchema } from '../../string'
import { groupedTokenSchema } from '../../grouped'

export const prefixParseFnTokenSchema = Schema.Union(
	identTokenSchema,
	intTokenSchema,
	ifTokenSchema,
	fnTokenSchema,
	boolTokenSchema,
	prefixTokenSchema,
	stringTokenSchema,
	groupedTokenSchema,
)

export type PrefixParseFnToken = typeof prefixParseFnTokenSchema.Type

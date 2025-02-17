import { Schema } from 'effect'
import { plusTokenSchema } from '../../plus'
import { minusTokenSchema } from '../../minus'
import { slashTokenSchema } from '../../slash'
import { asteriskTokenSchema } from '../../asterisk'
import { eqTokenSchema } from '../../eq'
import { notEqTokenSchema } from '../../not-eq'
import { ltTokenSchema } from '../../less-than'
import { gtTokenSchema } from '../../greater-than'
import { lpTokenSchema } from '../../left-paren'
import { exponentTokenSchema } from '../../exponent'

export const infixParseFnTokenSchema = Schema.Union(
	plusTokenSchema,
	minusTokenSchema,
	slashTokenSchema,
	asteriskTokenSchema,
	eqTokenSchema,
	notEqTokenSchema,
	ltTokenSchema,
	gtTokenSchema,
	lpTokenSchema,
	exponentTokenSchema,
)

export type InfixParseFnToken = typeof infixParseFnTokenSchema.Type

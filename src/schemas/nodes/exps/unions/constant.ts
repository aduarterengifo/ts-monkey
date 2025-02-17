import { Schema } from 'effect'
import { BoolExp, type BoolExpEncoded } from '../boolean'
import { IntExp, type IntExpEncoded } from '../int'
import { StrExp, type StrExpEncoded } from '../str'

export type ConstantExp = IntExp | StrExp | BoolExp

export type ConstantExpEncoded = IntExpEncoded | StrExpEncoded | BoolExpEncoded

export const constantExpSchema = Schema.suspend(
	(): Schema.Schema<ConstantExp, ConstantExpEncoded> =>
		Schema.Union(IntExp, StrExp, BoolExp),
)

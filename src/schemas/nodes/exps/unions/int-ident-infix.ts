import { Schema } from 'effect'
import { IntExp, type IntExpEncoded } from '../int'
import { IdentExp, type IdentExpEncoded } from '../ident'
import { InfixExp, type InfixExpEncoded } from '../infix'

export const polynomialExpSchema = Schema.Union(IntExp, IdentExp, InfixExp)

export type PolynomialExp = typeof polynomialExpSchema.Type

export type PolynomialExpEncoded =
	| IntExpEncoded
	| IdentExpEncoded
	| InfixExpEncoded

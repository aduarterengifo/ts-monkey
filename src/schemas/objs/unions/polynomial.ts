import { Schema } from "effect"
import { IdentObj, IdentObjEncoded, identObjSchema } from "../ident"
import { InfixObj, InfixObjEncoded, infixObjSchema } from "../infix"
import { IntObj, IntObjEncoded, intObjSchema } from "../int"

export type PolynomialObj =
	| IntObj
	| IdentObj
	| InfixObj

export type PolynomialObjEncoded =
	| IntObjEncoded
	| IdentObjEncoded
	| InfixObjEncoded

export const polynomialObjSchema = Schema.suspend(
	(): Schema.Schema<PolynomialObj, PolynomialObjEncoded> =>
		Schema.Union(
			intObjSchema,
			identObjSchema,
			infixObjSchema
		),
)

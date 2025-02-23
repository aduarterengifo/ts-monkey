import { Schema } from "effect";
import { IdentExp } from "../ident";
import { InfixExp } from "../infix";
import { IntExp } from "../int";

export const polynomialExpSchema = Schema.Union(IntExp, IdentExp, InfixExp);

export type PolynomialExp = typeof polynomialExpSchema.Type;

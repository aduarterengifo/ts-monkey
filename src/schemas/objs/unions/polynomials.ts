import type { IdentExp } from "@/schemas/nodes/exps/ident";
import { TokenType } from "@/schemas/token-types/union";
import { diffPolynomial } from "@/services/diff/obj";
import { Effect, Schema } from "effect";
import { IdentObj } from "../ident";
import { InfixObj, type InfixObjEncoded, OpInfixObj } from "../infix";
import { IntegerObj } from "../int";

export type PolynomialObj = IntegerObj | IdentObj | InfixObj;
export type PolynomialObjEncoded = IntegerObj | IdentObj | InfixObjEncoded;

export const PolynomialObj = Schema.suspend(
	(): Schema.Schema<PolynomialObj, PolynomialObjEncoded> =>
		Schema.Union(IntegerObj, IdentObj, InfixObj),
);

export const newTerm = (coeff: number, x: IdentObj, power: number) =>
	InfixObj.make({
		left: IntegerObj.make({ value: coeff }),
		operator: TokenType.ASTERISK,
		right: InfixObj.make({
			left: x,
			operator: TokenType.EXPONENT,
			right: IntegerObj.make({ value: power }),
		}),
	});

export const quotientRule = (f: PolynomialObj, g: PolynomialObj, x: IdentExp) =>
	Effect.gen(function* () {
		return InfixObj.make({
			left: InfixObj.make({
				left: OpInfixObj(TokenType.ASTERISK)(yield* diffPolynomial(f, x), g),
				operator: TokenType.MINUS,
				right: OpInfixObj(TokenType.ASTERISK)(f, yield* diffPolynomial(g, x)),
			}),
			operator: TokenType.SLASH,
			right: InfixObj.make({
				left: g,
				operator: TokenType.EXPONENT,
				right: IntegerObj.make({ value: 2 }),
			}),
		});
	});

export const productRule = (f: PolynomialObj, g: PolynomialObj, x: IdentExp) =>
	Effect.gen(function* () {
		return InfixObj.make({
			left: OpInfixObj(TokenType.ASTERISK)(yield* diffPolynomial(f, x), g),
			operator: TokenType.PLUS,
			right: OpInfixObj(TokenType.ASTERISK)(f, yield* diffPolynomial(g, x)),
		});
	});

export const sumAndDifferenceRule = (
	f: PolynomialObj,
	g: PolynomialObj,
	x: IdentExp,
	operator: typeof TokenType.PLUS | typeof TokenType.MINUS,
) =>
	Effect.gen(function* () {
		return InfixObj.make({
			left: yield* diffPolynomial(f, x),
			operator,
			right: yield* diffPolynomial(g, x),
		});
	});

export const powerRule = (coeff: IntegerObj, power: IntegerObj, x: IdentExp) =>
	newTerm(
		coeff.value * power.value,
		IdentObj.make({ identExp: x }),
		power.value - 1,
	);

export const constantRule = () => Effect.succeed(IntegerObj.make({ value: 0 }));

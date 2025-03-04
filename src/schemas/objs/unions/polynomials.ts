import type { IdentExp } from "@/schemas/nodes/exps/ident";
import { TokenType } from "@/schemas/token-types/union";
import { diffPolynomial } from "@/services/diff/obj";
import { Effect, Match, Schema } from "effect";
import type { ParseError } from "effect/ParseResult";
import { CallObj, type CallObjEncoded } from "../call";
import { IdentObj } from "../ident";
import { InfixObj, type InfixObjEncoded, OpInfixObj } from "../infix";
import { IntegerObj } from "../int";

export type PolynomialObj = IntegerObj | IdentObj | InfixObj | CallObj;
export type PolynomialObjEncoded =
	| IntegerObj
	| IdentObj
	| InfixObjEncoded
	| CallObjEncoded;

export const PolynomialObj = Schema.suspend(
	(): Schema.Schema<PolynomialObj, PolynomialObjEncoded> =>
		Schema.Union(IntegerObj, IdentObj, InfixObj, CallObj),
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

const diffBoth = (f: PolynomialObj, g: PolynomialObj, x: IdentExp) =>
	Effect.all([diffPolynomial(f, x), diffPolynomial(g, x)]);

export const quotientRule = (f: PolynomialObj, g: PolynomialObj, x: IdentExp) =>
	diffBoth(f, g, x).pipe(
		Effect.flatMap(([df, dg]) =>
			Effect.succeed(
				InfixObj.make({
					left: InfixObj.make({
						left: OpInfixObj(TokenType.ASTERISK)(df, g),
						operator: TokenType.MINUS,
						right: OpInfixObj(TokenType.ASTERISK)(f, dg),
					}),
					operator: TokenType.SLASH,
					right: InfixObj.make({
						left: g,
						operator: TokenType.EXPONENT,
						right: IntegerObj.make({ value: 2 }),
					}),
				}),
			),
		),
	);

export const productRule = (f: PolynomialObj, g: PolynomialObj, x: IdentExp) =>
	diffBoth(f, g, x).pipe(
		Effect.flatMap(([df, dg]) =>
			Effect.succeed(
				InfixObj.make({
					left: OpInfixObj(TokenType.ASTERISK)(df, g),
					operator: TokenType.PLUS,
					right: OpInfixObj(TokenType.ASTERISK)(f, dg),
				}),
			),
		),
	);

export const sumAndDifferenceRule = (
	f: PolynomialObj,
	g: PolynomialObj,
	x: IdentExp,
	operator: typeof TokenType.PLUS | typeof TokenType.MINUS,
) =>
	diffBoth(f, g, x).pipe(
		Effect.flatMap(([df, dg]) =>
			Effect.succeed(
				InfixObj.make({
					left: df,
					operator,
					right: dg,
				}),
			),
		),
	);

export const powerRule = (coeff: IntegerObj, power: IntegerObj, x: IdentExp) =>
	newTerm(
		coeff.value * power.value,
		IdentObj.make({ identExp: x }),
		power.value - 1,
	);

export const constantRule = () => Effect.succeed(IntegerObj.make({ value: 0 }));

export const recursivelySubstitute = (
	f: PolynomialObj,
	g: PolynomialObj,
	x: IdentExp,
): Effect.Effect<PolynomialObj, ParseError, never> =>
	Match.value(f).pipe(
		Match.tag("IdentObj", () => Effect.succeed(g)),
		Match.tag("IntegerObj", (intObj) => Effect.succeed(intObj)),
		Match.tag("InfixObj", ({ left, operator, right }) =>
			Effect.all([
				Schema.decodeUnknown(PolynomialObj)(left),
				Schema.decodeUnknown(PolynomialObj)(right),
			]).pipe(
				Effect.flatMap(([left, right]) =>
					Effect.all([
						recursivelySubstitute(left, g, x),
						recursivelySubstitute(right, g, x),
					]).pipe(
						Effect.flatMap(([left, right]) =>
							Effect.succeed(
								InfixObj.make({
									left,
									operator,
									right,
								}),
							),
						),
					),
				),
			),
		),
		Match.tag("CallObj", ({ fn }) =>
			Effect.succeed(CallObj.make({ fn, args: [g] })),
		),
		Match.exhaustive,
	);

export const chainRule = (f: PolynomialObj, g: PolynomialObj, x: IdentExp) =>
	Effect.all([diffPolynomial(f, x), diffPolynomial(g, x)]).pipe(
		Effect.flatMap(([left, right]) =>
			recursivelySubstitute(left, g, x).pipe(
				Effect.flatMap((left) =>
					Effect.succeed(
						InfixObj.make({
							left,
							operator: TokenType.ASTERISK,
							right,
						}),
					),
				),
			),
		),
	);

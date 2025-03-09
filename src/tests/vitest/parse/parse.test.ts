import { defaultLayer } from "@/layers/default";
import { BoolExp } from "@/schemas/nodes/exps/boolean";
import { nativeToIdentExp } from "@/schemas/nodes/exps/ident";
import { IfExp } from "@/schemas/nodes/exps/if";
import { InfixExp } from "@/schemas/nodes/exps/infix";
import { IntExp } from "@/schemas/nodes/exps/int";
import { Program } from "@/schemas/nodes/program";
import { ExpStmt } from "@/schemas/nodes/stmts/exp";
import { LetStmt } from "@/schemas/nodes/stmts/let";
import { ReturnStmt } from "@/schemas/nodes/stmts/return";
import { nodeString, tokenLiteral } from "@/schemas/nodes/union";
import { TokenType } from "@/schemas/token-types/union";
import {
	expectBooleanExpEq,
	expectIdentExpEq,
	expectIntExpEq,
} from "@/services/expectations/exp/eq";
import { Parser } from "@/services/parser";
import { testInfixExp } from "@/tests/parser/utils/test-infix-expression";
import { testLiteralExpression } from "@/tests/parser/utils/test-literal-expression";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { getExpFromProgram } from "./helper";

describe("parse", () => {
	it("nodeString program", () => {
		const program = Program.make({
			token: {
				_tag: TokenType.IDENT,
				literal: "myVar",
			},
			statements: [
				LetStmt.make({
					name: nativeToIdentExp("myVar"),
					token: {
						_tag: TokenType.LET,
						literal: TokenType.LET,
					},
					value: nativeToIdentExp("anotherVar"),
				}),
			],
		});
		expect(nodeString(program)).toBe(`${TokenType.LET} myVar = anotherVar;`);
	});
	it.effect("integer expression", () =>
		// TODO: generic testing.
		Effect.gen(function* () {
			const exp = yield* getExpFromProgram("5;");
			yield* expectIntExpEq(exp, 5);
		}).pipe(Effect.provide(Parser.Default)),
	);
	it.effect("boolean expression", () =>
		Effect.gen(function* () {
			const exp = yield* getExpFromProgram("true;");
			yield* expectBooleanExpEq(exp, true);
		}).pipe(Effect.provide(Parser.Default)),
	);
	it.effect("if expression", () =>
		Effect.gen(function* () {
			const exp = yield* getExpFromProgram(
				`${TokenType.IF} ${TokenType.LPAREN}x ${TokenType.LT} y${TokenType.RPAREN} ${TokenType.LBRACE} x ${TokenType.RBRACE}`,
			);
			const {
				condition,
				alternative,
				consequence: { statements },
			} = yield* Schema.decodeUnknown(IfExp)(exp);

			yield* testInfixExp(condition, "x", TokenType.LT, "y");

			const [consequence] = yield* Schema.decodeUnknown(Schema.Tuple(ExpStmt))(
				statements,
			);

			yield* expectIdentExpEq(consequence.expression, "x");

			expect(alternative).toBeUndefined();
		}).pipe(Effect.provide(defaultLayer)),
	);
	it.effect("if else expression", () =>
		Effect.gen(function* () {
			const exp = yield* getExpFromProgram(
				`${TokenType.IF} ${TokenType.LPAREN}x ${TokenType.LT} y${TokenType.RPAREN} ${TokenType.LBRACE} x ${TokenType.RBRACE} ${TokenType.ELSE} ${TokenType.LBRACE} y ${TokenType.RBRACE}`,
			);
			const {
				condition,
				alternative,
				consequence: { statements },
			} = yield* Schema.decodeUnknown(IfExp)(exp);

			yield* testInfixExp(condition, "x", TokenType.LT, "y");

			const [{ expression }] = yield* Schema.decodeUnknown(
				Schema.Tuple(ExpStmt),
			)(statements);

			yield* expectIdentExpEq(expression, "x");

			const [{ expression: altExp }] = yield* Schema.decodeUnknown(
				Schema.Tuple(ExpStmt),
			)(alternative?.statements);

			yield* expectIdentExpEq(altExp, "y");
		}).pipe(Effect.provide(defaultLayer)),
	);
	it.effect("nested if expression", () =>
		Effect.gen(function* () {
			const exp = yield* getExpFromProgram(`
            if (11 > 1) {
                if (10 > 1) {
                    return 10;
                }

                return 1;
            }`);

			const {
				condition,
				alternative,
				consequence: { statements },
			} = yield* Schema.decodeUnknown(IfExp)(exp);

			yield* testInfixExp(condition, "10", TokenType.GT, " 1");

			const [{ expression }, consequence2] = yield* Schema.decodeUnknown(
				Schema.Tuple(ExpStmt, ReturnStmt),
			)(statements);

			const consequence1IfExp = yield* Schema.decodeUnknown(IfExp)(expression);

			const consequence1IfExpCondition = yield* Schema.decodeUnknown(InfixExp)(
				consequence1IfExp.condition,
			);

			yield* testInfixExp(consequence1IfExpCondition, "10", ">", "1");

			const [innerFirstConsequence] = yield* Schema.decodeUnknown(
				Schema.Tuple(ReturnStmt),
			)(consequence1IfExp.consequence.statements);

			expect(tokenLiteral(innerFirstConsequence)).toBe("return");

			yield* testLiteralExpression(innerFirstConsequence.value, 10);
		}).pipe(Effect.provide(defaultLayer)),
	);
});

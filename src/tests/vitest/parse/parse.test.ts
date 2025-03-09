import { defaultLayer } from "@/layers/default";
import { IndexExp } from "@/schemas/nodes/exps";
import { ArrayExp } from "@/schemas/nodes/exps/array";
import { CallExp } from "@/schemas/nodes/exps/call";
import { FuncExp } from "@/schemas/nodes/exps/function";
import { nativeToIdentExp } from "@/schemas/nodes/exps/ident";
import { IfExp } from "@/schemas/nodes/exps/if";
import { InfixExp } from "@/schemas/nodes/exps/infix";
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
	expectStrExpEq,
} from "@/services/expectations/exp/eq";
import { Parser } from "@/services/parser";
import { testInfixExp } from "@/tests/parser/utils/test-infix-expression";
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
	it.effect("IntExp", () =>
		// TODO: generic testing.
		Effect.gen(function* () {
			const exp = yield* getExpFromProgram("5;");
			yield* expectIntExpEq(exp, 5);
		}).pipe(Effect.provide(Parser.Default)),
	);
	it.effect("BoolExp", () =>
		Effect.gen(function* () {
			const exp = yield* getExpFromProgram("true;");
			yield* expectBooleanExpEq(exp, true);
		}).pipe(Effect.provide(Parser.Default)),
	);
	describe("IfExp", () => {
		it.effect("if", () =>
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

				const [consequence] = yield* Schema.decodeUnknown(
					Schema.Tuple(ExpStmt),
				)(statements);

				yield* expectIdentExpEq(consequence.expression, "x");

				expect(alternative).toBeUndefined();
			}).pipe(Effect.provide(defaultLayer)),
		);
		it.effect("if else", () =>
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
		it.effect("nested if", () =>
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

				const [{ expression }, returnStmt] = yield* Schema.decodeUnknown(
					Schema.Tuple(ExpStmt, ReturnStmt),
				)(statements);

				const consequence1IfExp =
					yield* Schema.decodeUnknown(IfExp)(expression);

				const consequence1IfExpCondition = yield* Schema.decodeUnknown(
					InfixExp,
				)(consequence1IfExp.condition);

				yield* testInfixExp(consequence1IfExpCondition, "10", ">", "1");

				const [innerFirstConsequence] = yield* Schema.decodeUnknown(
					Schema.Tuple(ReturnStmt),
				)(consequence1IfExp.consequence.statements);

				expect(tokenLiteral(innerFirstConsequence)).toBe("return");

				yield* expectIntExpEq(innerFirstConsequence.value, 10);
				expect(alternative).toBeUndefined();

				expect(tokenLiteral(returnStmt)).toBe("return");
				yield* expectIntExpEq(returnStmt.value, 1);
			}).pipe(Effect.provide(defaultLayer)),
		);
	});
	it.effect("FuncExp", () =>
		Effect.gen(function* () {
			const exp = yield* getExpFromProgram(
				`${TokenType.FUNCTION}${TokenType.LPAREN}x,y${TokenType.RPAREN} ${TokenType.LBRACE} x + y${TokenType.RBRACE}${TokenType.SEMICOLON}`,
			);
			const {
				parameters,
				body: { statements },
			} = yield* Schema.decodeUnknown(FuncExp)(exp);

			expect(parameters.length).toBe(2);

			yield* expectIdentExpEq(parameters[0], "x");
			yield* expectIdentExpEq(parameters[1], "y");

			const [{ expression }] = yield* Schema.decodeUnknown(
				Schema.Tuple(ExpStmt),
			)(statements);

			const infixExp = yield* Schema.decodeUnknown(InfixExp)(expression);

			yield* testInfixExp(infixExp, "x", "+", "y");
		}).pipe(Effect.provide(defaultLayer)),
	);
	it.effect("CallExp", () =>
		Effect.gen(function* () {
			const exp = yield* getExpFromProgram("add(1, 2 * 3, 4 + 5);");

			const { fn, args } = yield* Schema.decodeUnknown(CallExp)(exp);

			yield* expectIdentExpEq(fn, "add");

			expect(args.length).toBe(3);

			yield* expectIntExpEq(args[0], 1);
			yield* testInfixExp(args[1], 2, TokenType.ASTERISK, 3);
			yield* testInfixExp(args[2], 4, TokenType.PLUS, 5);
		}).pipe(Effect.provide(defaultLayer)),
	);
	it.effect("StrExp", () =>
		Effect.gen(function* () {
			const exp = yield* getExpFromProgram('"hello world";');
			yield* expectStrExpEq(exp, "hello world");
		}).pipe(Effect.provide(defaultLayer)),
	);
	it.effect("Constant Folding", () =>
		Effect.gen(function* () {
			const exp = yield* getExpFromProgram("1 + 2 + 3 + (4 + 5);", true);
			yield* expectIntExpEq(exp, 15);
		}).pipe(Effect.provide(defaultLayer)),
	);
	it.effect("IdentExp", () =>
		Effect.gen(function* () {
			const exp = yield* getExpFromProgram("foobar;");

			yield* expectIdentExpEq(exp, "foobar");
		}).pipe(Effect.provide(defaultLayer)),
	);
	it.effect("ArrayExp", () =>
		Effect.gen(function* () {
			const exp = yield* getExpFromProgram("[1, 2 * 2, 3 + 3]");

			const { elements } = yield* Schema.decodeUnknown(ArrayExp)(exp);

			expect(elements.length).toBe(3);

			yield* expectIntExpEq(elements[0], 1);
			yield* testInfixExp(elements[1], 2, TokenType.ASTERISK, 2);
			yield* testInfixExp(elements[2], 3, TokenType.PLUS, 3);
		}).pipe(Effect.provide(defaultLayer)),
	);
	it.effect("IndexExp", () =>
		Effect.gen(function* () {
			const exp = yield* getExpFromProgram("myArray[1 + 1]");

			const { left, index } = yield* Schema.decodeUnknown(IndexExp)(exp);

			yield* expectIdentExpEq(left, "myArray");
			yield* testInfixExp(index, 1, TokenType.PLUS, 1);
		}).pipe(Effect.provide(defaultLayer)),
	);
});

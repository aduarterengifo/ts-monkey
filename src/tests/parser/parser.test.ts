import { describe, expect, test } from "bun:test";
import { nodeString, tokenLiteral } from "@/schemas/nodes/union";
import { Effect, LogLevel, Logger, ManagedRuntime, Schema } from "effect";
import { logDebug } from "effect/Effect";
import type { ParseError } from "effect/ParseResult";
import type { KennethParseError } from "src/errors/kenneth/parse";
import { BoolExp } from "src/schemas/nodes/exps/boolean";
import { CallExp } from "src/schemas/nodes/exps/call";
import { FuncExp } from "src/schemas/nodes/exps/function";
import { IdentExp } from "src/schemas/nodes/exps/ident";
import { IfExp } from "src/schemas/nodes/exps/if";
import { InfixExp } from "src/schemas/nodes/exps/infix";
import { IntExp } from "src/schemas/nodes/exps/int";
import { StrExp } from "src/schemas/nodes/exps/str";
import { Program } from "src/schemas/nodes/program";
import { ExpStmt } from "src/schemas/nodes/stmts/exp";
import { LetStmt } from "src/schemas/nodes/stmts/let";
import { ReturnStmt } from "src/schemas/nodes/stmts/return";
import { TokenType } from "src/schemas/token-types/union";
import { Parser } from "src/services/parser";
import { testIdentifier } from "./utils/test-identifier";
import { testInfixExpression } from "./utils/test-infix-expression";
import { testIntExp } from "./utils/test-int-exp";
import { testLiteralExpression } from "./utils/test-literal-expression";
import { testStrExp } from "./utils/test-str-exp";

describe("parser", () => {
	test("string", () => {
		const program = new Program({
			token: { _tag: TokenType.IDENT, literal: "myVar" },
			statements: [
				new LetStmt({
					name: new IdentExp({
						token: { _tag: TokenType.IDENT, literal: "myVar" },
						value: "myVar",
					}),
					token: { _tag: TokenType.LET, literal: "let" },
					value: new IdentExp({
						token: { _tag: TokenType.IDENT, literal: "anotherVar" },
						value: "anotherVar",
					}),
				}),
			],
		});

		expect(nodeString(program)).toBe("let myVar = anotherVar;");
	});
	test("integer literal expression", () => {
		const input = "5;";

		const program = (expStmt: ExpStmt) =>
			Effect.gen(function* () {
				const expStmt = yield* getExpStmt(input);

				const intExp = yield* Schema.decodeUnknown(IntExp)(expStmt.expression);

				yield* testIntExp(intExp, 5);
			});

		runTest(input, program);
	});
	test("boolean literal expression", () => {
		const input = "true;";

		const program = (expStmt: ExpStmt) =>
			Effect.gen(function* () {
				const boolExp = yield* Schema.decodeUnknown(BoolExp)(
					expStmt.expression,
				);

				yield* testLiteralExpression(boolExp, true);
			});

		runTest(input, program);
	});
	test("if expression", () => {
		const input = "if (x < y) { x }";

		const program = (expStmt: ExpStmt) =>
			Effect.gen(function* () {
				const ifExp = yield* Schema.decodeUnknown(IfExp)(expStmt.expression);

				yield* testInfixExpression(ifExp.condition, "x", "<", "y");

				const [consequence] = yield* Schema.decodeUnknown(
					Schema.Tuple(ExpStmt),
				)(ifExp.consequence.statements);

				yield* testIdentifier(consequence.expression, "x");

				expect(ifExp.alternative).toBeUndefined();
			});

		runTest(input, program);
	});
	test("if else expression", () => {
		const input = "if (x < y) { x } else { y }";

		const program = (expStmt: ExpStmt) =>
			Effect.gen(function* () {
				const ifExp = yield* Schema.decodeUnknown(IfExp)(expStmt.expression);

				yield* testInfixExpression(ifExp.condition, "x", "<", "y");

				const [consequence] = yield* Schema.decodeUnknown(
					Schema.Tuple(ExpStmt),
				)(ifExp.consequence.statements);

				yield* testIdentifier(consequence.expression, "x");

				const [alternative] = yield* Schema.decodeUnknown(
					Schema.Tuple(ExpStmt),
				)(ifExp.alternative?.statements);

				yield* testIdentifier(alternative.expression, "y");
			});

		runTest(input, program);
	});
	test("nested if  expression", () => {
		const input = `
		if (11 > 1) {
			if (10 > 1) {
				return 10;
			}

			return 1;
		}`;

		const program = (expStmt: ExpStmt) =>
			Effect.gen(function* () {
				const ifExp = yield* Schema.decodeUnknown(IfExp)(expStmt.expression);

				yield* testInfixExpression(ifExp.condition, "11", ">", "1");
				expect(ifExp.consequence.statements.length).toBe(2);

				const [consequence1, consequence2] = yield* Schema.decodeUnknown(
					Schema.Tuple(ExpStmt, ReturnStmt),
				)(ifExp.consequence.statements);

				const consequence1IfExp = yield* Schema.decodeUnknown(IfExp)(
					consequence1.expression,
				);

				const consequence1IfExpCondition = yield* Schema.decodeUnknown(
					InfixExp,
				)(consequence1IfExp.condition);

				yield* testInfixExpression(consequence1IfExpCondition, "10", ">", "1");
				expect(consequence1IfExp.consequence.statements.length).toBe(1);

				const [innerFirstConsequence] = yield* Schema.decodeUnknown(
					Schema.Tuple(ReturnStmt),
				)(consequence1IfExp.consequence.statements);

				expect(tokenLiteral(innerFirstConsequence)).toBe("return");
				yield* testLiteralExpression(innerFirstConsequence.value, 10);

				expect(ifExp.alternative).toBeUndefined();

				expect(tokenLiteral(consequence2)).toBe("return");
				yield* testLiteralExpression(consequence2.value, 10);
			});

		runTest(input, program);
	});
	test("function literal parsing", () => {
		const input = "fn(x,y) { x + y; }";

		const program = (expStmt: ExpStmt) =>
			Effect.gen(function* () {
				const funcExp = yield* Schema.decodeUnknown(FuncExp)(
					expStmt.expression,
				);

				expect(funcExp.parameters.length).toBe(2);
				testLiteralExpression(funcExp.parameters[0], "x");
				testLiteralExpression(funcExp.parameters[1], "y");

				const [bodyExpStmt] = yield* Schema.decodeUnknown(
					Schema.Tuple(ExpStmt),
				)(funcExp.body.statements);

				const infixExp = yield* Schema.decodeUnknown(InfixExp)(
					bodyExpStmt.expression,
				);
				testInfixExpression(infixExp, "x", "+", "y");
			});

		runTest(input, program);
	});
	test("call expression parsing", () => {
		const input = "add(1, 2 * 3, 4 + 5);";

		const program = (expStmt: ExpStmt) =>
			Effect.gen(function* () {
				const callExp = yield* Schema.decodeUnknown(CallExp)(
					expStmt.expression,
				);

				yield* testIdentifier(callExp.fn, "add");

				expect(callExp.args.length).toBe(3);

				testLiteralExpression(callExp.args[0], 1);
				testInfixExpression(callExp.args[1], 2, TokenType.ASTERISK, 3);
				testInfixExpression(callExp.args[2], 4, TokenType.PLUS, 5);
			});

		runTest(input, program);
	});
	test("string literal expression", () => {
		const input = '"hello world";';
		const program = (expStmt: ExpStmt) =>
			Effect.gen(function* () {
				const strExp = yield* Schema.decodeUnknown(StrExp)(expStmt.expression);

				yield* testStrExp(strExp, "hello world");
			});

		runTest(input, program);
	});
	test("constant folding", () => {
		const input = "1 + 2 + 3 + (4 + 5);";

		const program = (expStmt: ExpStmt) =>
			Effect.gen(function* () {
				yield* logDebug("expStmt", expStmt);
				const intExp = yield* Schema.decodeUnknown(IntExp)(expStmt.expression);

				yield* testIntExp(intExp, 15);
			});

		runTest(input, program, true);
	});
	test("identifier expression", () => {
		const input = "foobar;";

		const program = (expStmt: ExpStmt) =>
			Effect.gen(function* () {
				const identExp = yield* Schema.decodeUnknown(IdentExp)(
					expStmt.expression,
				);

				expect(identExp.value).toBe("foobar");
				expect(tokenLiteral(identExp)).toBe("foobar");
			});

		runTest(input, program);
	});
	test("integer literal expression", () => {
		const input = "5;";

		const p = (expStmt: ExpStmt) =>
			Effect.gen(function* () {
				const intExp = yield* Schema.decodeUnknown(IntExp)(expStmt.expression);

				yield* testIntExp(intExp, 5);
			});

		runTest(input, p);
	});
});

const getExpStmt = (input: string, optimized = false) =>
	Effect.gen(function* () {
		const parser = yield* Parser;
		yield* parser.init(input);

		const program = optimized
			? yield* parser.parseProgramOptimized
			: yield* parser.parseProgram;

		const [expStmt] = yield* Schema.decodeUnknown(Schema.Tuple(ExpStmt))(
			program.statements,
		);
		return expStmt;
	});

const runTest = (
	input: string,
	p: (
		expStmt: ExpStmt,
	) => Effect.Effect<void, ParseError | KennethParseError, Parser>,
	optimized = false,
) =>
	ManagedRuntime.make(Parser.Default).runPromise(
		getExpStmt(input, optimized)
			.pipe(Effect.flatMap(p))
			.pipe(
				Logger.withMinimumLogLevel(LogLevel.Debug),
				Effect.withSpan("myspan"),
			),
	);

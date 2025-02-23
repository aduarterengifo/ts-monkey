import { describe, expect, test } from "bun:test";
import { nodeString, tokenLiteral } from "@/schemas/nodes/union";
import { ErrorObj } from "@/schemas/objs/error";
import type { Obj } from "@/schemas/objs/union";
import {
	Effect,
	Layer,
	LogLevel,
	Logger,
	ManagedRuntime,
	Match,
	Schema,
} from "effect";
import { logDebug } from "effect/Effect";
import { CallExp } from "src/schemas/nodes/exps/call";
import { FuncExp } from "src/schemas/nodes/exps/function";
import { PrefixExp } from "src/schemas/nodes/exps/prefix";
import type { Program } from "src/schemas/nodes/program";
import { ExpStmt } from "src/schemas/nodes/stmts/exp";
import { LetStmt } from "src/schemas/nodes/stmts/let";
import { ReturnStmt } from "src/schemas/nodes/stmts/return";
import { TokenType } from "src/schemas/token-types/union";
import { Eval, Evaluator } from "src/services/evaluator";
import { isErrorObj, isFunctionObj, isStringObj } from "src/services/object";
import { createEnvironment } from "src/services/object/environment";
import { Parser } from "src/services/parser";
import { testLetStatement } from "../parser/statements/let";
import { testIdentifier } from "../parser/utils/test-identifier";
import { testInfixExpression } from "../parser/utils/test-infix-expression";
import { testLiteralExpression } from "../parser/utils/test-literal-expression";
import {
	testBooleanObject,
	testErrorObject,
	testIntegerObject,
	testNullOject,
	testStringObject,
} from "./utils";

type TestSuite = {
	description: string;
	tests: [input: string, expected: unknown][];
	fn:
		| ((
				expected: unknown,
		  ) => (program: Program) => Effect.Effect<unknown, never, never>)
		| ((
				expected: unknown,
		  ) => (evaluated: Obj) => Effect.Effect<unknown, never, never>);
};

const testSuites: {
	name: string;
	kind: "parse" | "eval";
	suite: TestSuite[];
}[] = [
	{
		name: "parse",
		kind: "parse",
		suite: [
			{
				description: "function parameter",
				tests: [
					["fn() {};", []],
					["fn(x) {};", ["x"]],
					["fn(x,y,z) {};", ["x", "y", "z"]],
				],
				fn: (expected: string[]) => (program: Program) =>
					Effect.gen(function* () {
						const stmt = program.statements[0];

						const expStmt = yield* Schema.decodeUnknown(ExpStmt)(stmt);

						const fn = yield* Schema.decodeUnknown(FuncExp)(expStmt.expression);

						expect(fn.parameters.length).toBe(expected.length);
						expected.forEach((param, index) => {
							testLiteralExpression(fn.parameters[index], param);
						});
					}),
			},
			{
				description: "operator precedence",
				tests: [
					["-a * b", "((-a) * b)"],
					["!-a", "(!(-a))"],
					["a + b + c", "((a + b) + c)"],
					["a + b + c + d", "(((a + b) + c) + d)"],
					["a + b - c", "((a + b) - c)"],
					["a * b * c", "((a * b) * c)"],
					["a * b / c", "((a * b) / c)"],
					["a + b / c", "(a + (b / c))"],
					["a + b * c + d / e - f", "(((a + (b * c)) + (d / e)) - f)"],
					["3 + 4; -5 * 5", "(3 + 4)((-5) * 5)"],
					["5 > 4 == 3 < 4", "((5 > 4) == (3 < 4))"],
					["5 < 4 != 3 > 4", "((5 < 4) != (3 > 4))"],
					[
						"3 + 4 * 5 == 3 * 1 + 4 * 5",
						"((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
					],
					["true", "true"],
					["false", "false"],
					["3 > 5 == false", "((3 > 5) == false)"],
					["3 < 5 == true", "((3 < 5) == true)"],
					["1 + (2 + 3) + 4", "((1 + (2 + 3)) + 4)"],
					["(5 + 5) * 2", "((5 + 5) * 2)"],
					["2 / (5 + 5)", "(2 / (5 + 5))"],
					["-(5 + 5)", "(-(5 + 5))"],
					["!(true == true)", "(!(true == true))"],
					["a + add(b * c) + d", "((a + add((b * c))) + d)"],
					[
						"add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
						"add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
					],
					[
						"add(a + b + c * d / f + g)",
						"add((((a + b) + ((c * d) / f)) + g))",
					],
					["5 ** 5 * 7", "((5 ** 5) * 7)"],
				],
				fn: (expected: string) => (program: Program) =>
					Effect.gen(function* () {
						const actual = nodeString(program);
						yield* Effect.succeed(expect(actual).toBe(expected));
					}),
			},
			{
				description: "let statements",
				tests: [
					[
						"let x = 5;",
						{
							identifier: "x",
							value: 5,
						},
					],
					[
						"let y = true;",
						{
							identifier: "y",
							value: true,
						},
					],
					[
						"let foobar = y;",
						{
							identifier: "foobar",
							value: "y",
						},
					],
				],
				fn:
					(expected: {
						identifier: string;
						value: number | string | boolean;
					}) =>
					(program: Program) =>
						Effect.gen(function* () {
							expect(program.statements.length).toBe(1);

							const [letStmt] = yield* Schema.decodeUnknown(
								Schema.Tuple(LetStmt),
							)(program.statements);

							yield* testLetStatement(letStmt, expected.identifier);

							yield* testLiteralExpression(letStmt.value, expected.value);
						}),
			},
			{
				description: "return statements",
				tests: [
					["return 5;", 5],
					["return 10;", 10],
					["return 993322;", 993322],
				],
				fn: (expected: number) => (program: Program) =>
					Effect.gen(function* () {
						const [returnStmt] = yield* Schema.decodeUnknown(
							Schema.Tuple(ReturnStmt),
						)(program.statements);

						expect(tokenLiteral(returnStmt)).toBe("return");
						yield* testLiteralExpression(returnStmt.value, expected);
					}),
			},
			{
				description: "call parameter",
				tests: [
					[
						"add();",
						{
							ident: "add",
							args: [],
						},
					],
					[
						"add(1);",
						{
							ident: "add",
							args: ["1"],
						},
					],
					[
						"add(1, 2 * 3, 4 + 5);",
						{
							ident: "add",
							args: ["1", "(2 * 3)", "(4 + 5)"],
						},
					],
				],
				fn:
					(expected: { ident: string; args: string[] }) => (program: Program) =>
						Effect.gen(function* () {
							const [expStmt] = yield* Schema.decodeUnknown(
								Schema.Tuple(ExpStmt),
							)(program.statements);

							const callExp = yield* Schema.decodeUnknown(CallExp)(
								expStmt.expression,
							);

							yield* testIdentifier(callExp.fn, expected.ident);

							expect(callExp.args.length).toBe(expected.args.length);
							expected.args.forEach((expectedArg, i) => {
								expect(nodeString(callExp.args[i])).toBe(expectedArg);
							});
						}),
			},
			{
				description: "infix expressions",
				tests: [
					["5 + 5;", { left: 5, operator: TokenType.PLUS, right: 5 }],
					["5 - 5;", { left: 5, operator: TokenType.MINUS, right: 5 }],
					["5 * 5;", { left: 5, operator: TokenType.ASTERISK, right: 5 }],
					["5 / 5;", { left: 5, operator: TokenType.SLASH, right: 5 }],
					["5 > 5;", { left: 5, operator: TokenType.GT, right: 5 }],
					["5 < 5;", { left: 5, operator: TokenType.LT, right: 5 }],
					["5 == 5;", { left: 5, operator: TokenType.EQ, right: 5 }],
					["5 != 5;", { left: 5, operator: TokenType.NOT_EQ, right: 5 }],
					["5 ** 5", { left: 5, operator: TokenType.EXPONENT, right: 5 }],
					["true == true", { left: true, operator: TokenType.EQ, right: true }],
					[
						"true != false",
						{ left: true, operator: TokenType.NOT_EQ, right: false },
					],
					[
						"false == false",
						{ left: false, operator: TokenType.EQ, right: false },
					],
				],
				fn:
					(expected: {
						left: number | boolean;
						operator: string;
						right: number | boolean;
					}) =>
					(program: Program) =>
						Effect.gen(function* () {
							const [expStmt] = yield* Schema.decodeUnknown(
								Schema.Tuple(ExpStmt),
							)(program.statements);

							testInfixExpression(
								expStmt.expression,
								expected.left,
								expected.operator,
								expected.right,
							);

							yield* Effect.succeed(true);
						}),
			},
			{
				description: "prefix expressions",
				tests: [
					["!5;", { operator: TokenType.BANG, value: 5 }],
					["-15;", { operator: TokenType.MINUS, value: 15 }],
					["!true", { operator: TokenType.BANG, value: true }],
					["!false", { operator: TokenType.BANG, value: false }],
				],
				fn:
					(expected: { operator: string; value: number | boolean }) =>
					(program: Program) =>
						Effect.gen(function* () {
							const [expStmt] = yield* Schema.decodeUnknown(
								Schema.Tuple(ExpStmt),
							)(program.statements);

							const prefixExp = yield* Schema.decodeUnknown(PrefixExp)(
								expStmt.expression,
							);

							expect(prefixExp.operator).toBe(expected.operator);
							yield* testLiteralExpression(prefixExp.right, expected.value);
						}),
			},
		],
	},
	{
		name: "eval",
		kind: "eval",
		suite: [
			{
				description: "eval integer expression",
				tests: [
					["5", 5],
					["10", 10],
					["-5", -5],
					["-10", -10],
					["5 + 5 + 5 + 5 - 10", 10],
					["2 * 2 * 2 * 2 * 2", 32],
					["-50 + 100 + -50", 0],
					["5 * 2 + 10", 20],
					["5 + 2 * 10", 25],
					["20 + 2 * -10", 0],
					["50 / 2 * 2 + 10", 60],
					["2 * (5 + 10)", 30],
					["3 * 3 * 3 + 10", 37],
					["3 * (3 * 3) + 10", 37],
					["(5 + 10 * 2 + 15 / 3) * 2 + -10", 50],
					["2 ** 2", 4],
				],
				fn: (expected: number) => (evaluated: Obj) =>
					testIntegerObject(evaluated, expected),
			},
			{
				description: "eval boolean expression",
				tests: [
					["true", true],
					["false", false],
					["1 < 2", true],
					["1 > 2", false],
					["1 < 1", false],
					["1 > 1", false],
					["1 == 1", true],
					["1 != 1", false],
					["1 == 2", false],
					["1 != 2", true],
					["true == true", true],
					["false == false", true],
					["true == false", false],
					["true != false", true],
					["false != true", true],
					["(1 < 2) == true", true],
					["(1 < 2) == false", false],
					["(1 > 2) == true", false],
					["(1 > 2) == false", true],
				],
				fn: (expected: boolean) => (evaluated: Obj) =>
					testBooleanObject(evaluated, expected),
			},
			{
				description: "bang operator",
				tests: [
					["!true", false],
					["!false", true],
					["!5", false],
					["!!true", true],
					["!!false", false],
					["!!5", true],
				],
				fn: (expected: boolean) => (evaluated: Obj) =>
					testBooleanObject(evaluated, expected),
			},
			{
				description: "if else expressions",
				tests: [
					["if (true) { 10 }", 10],
					["if (false) { 10 }", null],
					["if (1) { 10 }", 10],
					["if (1 < 2) { 10 }", 10],
					["if (1 > 2) { 10 }", null],
					["if (1 > 2) { 10 } else { 20 }", 20],
					["if (1 < 2) { 10 } else { 20 }", 10],
				],
				fn: (expected: unknown) => (evaluated: Obj) =>
					Effect.gen(function* () {
						if (typeof expected === "number") {
							yield* testIntegerObject(evaluated, expected);
						} else {
							yield* testNullOject(evaluated);
						}
					}),
			},
			{
				description: "return statements",
				tests: [
					["return 10;", 10],
					["return 10; 9;", 10],
					["return 2 * 5; 9;", 10],
					["9; return 2 * 5; 9;", 10],
					[
						`
						    if (10 > 1) {
						        if (10 > 1) {
						            return 10;
						        }

						        return 1;
						    }
						    `,
						10,
					],
				],
				fn: (expected: number) => (evaluated: Obj) =>
					Effect.gen(function* () {
						yield* testIntegerObject(evaluated, expected);
					}),
			},
			{
				description: "error handling",
				tests: [
					["5 + true;", "type mismatch: INTEGER + BOOLEAN"],
					["5 + true; 5;", "type mismatch: INTEGER + BOOLEAN"],
					["-true", "unknown operator: -BOOLEAN"],
					["true + false;", "unknown operator: BOOLEAN + BOOLEAN"],
					["5; true + false; 5", "unknown operator: BOOLEAN + BOOLEAN"],
					[
						"if (10 > 1) { true + false; }",
						"unknown operator: BOOLEAN + BOOLEAN",
					],
					[
						`
			if (10 > 1) {
			  if (10 > 1) {
			    return true + false;
			  }

			  return 1;
			}
			`,
						"unknown operator: BOOLEAN + BOOLEAN",
					],
					["foobar", "identifier not found: foobar"],
				],
				fn: (expected: string) => (evaluated: Obj) =>
					testErrorObject(evaluated, expected),
			},
			{
				description: "let statements",
				tests: [
					["let a = 5; a;", 5],
					["let a = 5 * 5; a;", 25],
					["let a = 5; let b = a; b;", 5],
					["let a = 5; let b = a; let c = a + b + 5; c;", 15],
				],
				fn: (expected: number) => (evaluated: Obj) =>
					testIntegerObject(evaluated, expected),
			},
			{
				description: "function application",
				tests: [
					["let identity = fn(x) { x; }; identity(5);", 5],
					["let identity = fn(x) { return x; }; identity(5);", 5],
					["let double = fn(x) { x * 2; }; double(5);", 10],
					["let add = fn(x, y) { x + y; }; add(5, 5);", 10],
					["let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));", 20],
					["fn(x) { x; }(5)", 5],
					["let add = fn(x, y) { fn (x,y) {x + y}; }; add(5,5)(4,4)", 8], // calling functions with less args than they have leaves to problems...
				],
				fn: (expected: number) => (evaluated: Obj) =>
					testIntegerObject(evaluated, expected),
			},
			{
				description: "built in functions",
				tests: [
					['len("")', 0],
					['len("four")', 4],
					['len("hello world")', 11],
					['let hello = fn(x) { "hello" }; len(hello(1))', 5],
					["len(1)", 'argument to "len" not supported, got IntegerObj'],
					['len("one", "two")', "wrong number of arguments. got=2, want=1"],
				],
				fn: (expected: number) => (evaluated: Obj) =>
					Effect.gen(function* () {
						if (typeof expected === "number") {
							yield* testIntegerObject(evaluated, expected);
						} else {
							expect(isErrorObj(evaluated)).toBe(true);
							if (isErrorObj(evaluated)) {
								expect(evaluated.message).toBe(expected);
							}
						}
					}),
			},
			{
				description: "differentiation",
				tests: [
					["diff(fn(x) { x })(3)", 1],
					["diff(fn(x) { 2 })(3)", 0],
					["diff(fn(x) { 2 * x })(3)", 2],
					["diff(fn(x) { (2 + 0) * x })(3)", 2],
					["let second = 2; diff(fn(x) { x ** second })(3)", 6],
					["diff(fn(x) { 3 * x ** 2 })(3)", 18],
					["diff(fn(x) { 2 + 2 })(3)", 0],
					["diff(fn(x) { 2 + x })(3)", 1],
					["diff(fn(x) { 2 * x ** 3 + x + 3 })(3)", 55],
					["diff(fn(x) { 2 * x ** 3 + (x + 3) })(3)", 55],
					["diff(fn(x) { 2 * x ** 3 + x + 3 + 4 * x + 5 * x ** 4 })(3)", 599],
					["let f = fn(y) { y }; diff(fn(x) { x ** 7 + f(2) })(3)", 5103],
					["let f = fn(y) { y }; diff(fn(x) { x ** 7 + f(x) })(3)", 5104],
					["let second = 2; diff(fn(x) { x ** 7 + second })(3)", 5103],
				],
				fn: (expected: number) => (evaluated: Obj) =>
					Effect.gen(function* () {
						yield* testIntegerObject(evaluated, expected);
					}),
			},
			{
				description: "differentiation substraction",
				tests: [["diff(fn(x) { 2 * x ** 3 - (x + 3) })(3)", 53]],
				fn: (expected: number) => (evaluated: Obj) =>
					Effect.gen(function* () {
						yield* testIntegerObject(evaluated, expected);
					}),
			},
			{
				description: "product rule",
				tests: [
					["diff(fn(x) { (x + 2 * x ** 3) * (x + 1) })(3)", 277],
					[
						"diff(fn(x) { (x + 2 * x ** 3) * (x + 1) + (x + 3 * x ** 3) * (x + 1)  })(3)",
						689,
					],
				],
				fn: (expected: number) => (evaluated: Obj) =>
					Effect.gen(function* () {
						yield* testIntegerObject(evaluated, expected);
					}),
			},
			{
				description: "quotient rule",
				tests: [
					["diff(fn(x) { (x + 2 * x ** 3) / (x + 1) })(3)", 163 / 16],
					[
						"diff(fn(x) { (x + 2 * x ** 3) / (x + 1) + (x + 3 * x ** 3) / (x + 1)  })(3)",
						163 / 16 + 61 / 4,
					],
				],
				fn: (expected: number) => (evaluated: Obj) =>
					Effect.gen(function* () {
						yield* testIntegerObject(evaluated, expected);
					}),
			},
			{
				description: "chain rule",
				tests: [
					// ["let g = fn(y) { y ** 3 }; diff(fn (x) {  2 * g(x) + x })", 10],
					["diff(fn (x) { (3 * x ** 2 + 5 * x) ** 4 })(3)", 6816096],
					["diff(fn (x) { 1 / (2 * x + 3) })(3)", -2 / 81],
				],
				fn: (expected: number) => (evaluated: Obj) =>
					Effect.gen(function* () {
						yield* testIntegerObject(evaluated, expected);
					}),
			},
			{
				description: "string concatenation",
				tests: [['"Hello" + " " + "World!"', "Hello World!"]],
				fn: (expected: string) => (evaluated: Obj) =>
					Effect.gen(function* () {
						yield* testStringObject(evaluated, expected);
					}),
			},
			{
				description: "addition",
				tests: [
					["1 + 2 + 3 + 4", 10],
					["1 + 2 + 3 + (4 + 5)", 15],
				],
				fn: (expected: number) => (evaluated: Obj) =>
					Effect.gen(function* () {
						yield* testIntegerObject(evaluated, expected);
					}),
			},
			{
				description: "pi",
				tests: [["pi()", Math.PI]],
				fn: (expected: number) => (evaluated: Obj) =>
					testIntegerObject(evaluated, expected),
			},
			{
				description: "trig",
				tests: [
					["sin(0)", Math.sin(0)],
					["sin(pi() / 2)", Math.sin(Math.PI / 2)],
					["cos(0)", Math.cos(0)],
					["cos(pi() / 2)", Math.cos(Math.PI / 2)],
					["tan(0)", Math.tan(0)],
					["tan(pi() / 4)", Math.tan(Math.PI / 4)],
				],
				fn: (expected: number) => (evaluated: Obj) =>
					testIntegerObject(evaluated, expected),
			},
			{
				description: "log and exp",
				tests: [
					["ln(0)", Math.log(0)],
					["ln(1)", Math.log(1)],
					["ln(e())", Math.log(Math.E)],
					["exp(e())", Math.exp(Math.E)],
					["exp(1)", Math.exp(1)],
					["ln(exp(3))", Math.log(Math.exp(3))],
				],
				fn: (expected: number) => (evaluated: Obj) =>
					testIntegerObject(evaluated, expected),
			},
			// {
			// 	description: 'env',
			// 	tests: [
			// 		[
			// 			'let a = 2; let c = fn(f) { f }; let b = c(fn(x) { x ** a });a = 3; b(2)',
			// 			8,
			// 		],
			// 	],
			// 	fn: (expected: number) => (evaluated: Obj) =>
			// 		Effect.gen(function* () {
			// 			yield* logDebug('eval', evaluated)
			// 			yield* testIntegerObject(evaluated, expected)
			// 		}),
			// },
		],
	},
];

for (const { name, kind, suite } of testSuites) {
	describe(name, () => {
		for (const { description, tests, fn } of suite) {
			test.each(tests)(description, (input, expected) => {
				const matchProgram = Match.value(kind).pipe(
					Match.when("parse", () =>
						Effect.gen(function* () {
							const parser = yield* Parser;
							yield* parser.init(input);
							const program = yield* parser.parseProgram;
							const loadedFn = fn(expected);
							return yield* loadedFn(program);
						}),
					),
					Match.when("eval", () =>
						Effect.gen(function* () {
							const evaluator = yield* Evaluator;
							const evaluated = yield* evaluator.run(input);
							const loadedFn = fn(expected);
							return yield* loadedFn(evaluated);
						}),
					),
					Match.exhaustive,
				);

				ManagedRuntime.make(
					Layer.mergeAll(Parser.Default, Evaluator.Default),
				).runPromise(
					matchProgram.pipe(
						Effect.catchAll((error) => {
							console.log("error", error);
							if (error._tag === "KennethEvalError") {
								return Effect.succeed(
									ErrorObj.make({ message: error.message }),
								).pipe(Effect.tap(Effect.logDebug("blew up")));
							}
							if (error._tag === "ParseError") {
								return Effect.succeed(
									ErrorObj.make({ message: error.message }),
								);
							}

							return expect(true).toBe(false);
						}),
						Logger.withMinimumLogLevel(LogLevel.Debug),
						Effect.withSpan(`$name-$description`),
						Effect.provide(Parser.Default),
					),
				);
			});
		}
	});
}

describe("eval", () => {
	test("function object", () => {
		const input = "fn(x) { x+ 2} ";

		const program = Effect.gen(function* () {
			const parser = yield* Parser;
			yield* parser.init(input);

			const program = yield* parser.parseProgram;
			const env = createEnvironment();
			const evaluated = yield* Eval(program)(env, undefined);
			expect(isFunctionObj(evaluated)).toBe(true);
			if (isFunctionObj(evaluated)) {
				expect(evaluated.params.length).toBe(1);
				expect(nodeString(evaluated.params[0])).toBe("x");
				expect(nodeString(evaluated.body)).toBe("(x + 2)");
			}
		}).pipe(
			Logger.withMinimumLogLevel(LogLevel.Debug),
			Effect.withSpan("myspan"),
		);

		ManagedRuntime.make(Parser.Default).runPromise(program);
	});
	test("closures", () => {
		const input = `
		let newAdder = fn(x) {
		  fn(y) { x + y };
		};

		let addTwo = newAdder(2);
		addTwo(2);
		`;

		const program = Effect.gen(function* () {
			const parser = yield* Parser;
			yield* parser.init(input);

			const program = yield* parser.parseProgram;
			const env = createEnvironment();
			const evaluated = yield* Eval(program)(env);

			yield* testIntegerObject(evaluated, 4);
		}).pipe(
			Logger.withMinimumLogLevel(LogLevel.Debug),
			Effect.withSpan("myspan"),
		);

		ManagedRuntime.make(Parser.Default).runPromise(program);
	});
	test("string literals", () => {
		const input = '"Hello World!"';

		const program = Effect.gen(function* () {
			const parser = yield* Parser;
			yield* parser.init(input);

			const program = yield* parser.parseProgram;
			const env = createEnvironment();
			const evaluated = yield* Eval(program)(env);

			expect(isStringObj(evaluated)).toBe(true);
			if (isStringObj(evaluated)) {
				expect(evaluated.value).toBe("Hello World!");
			}
		}).pipe(
			Logger.withMinimumLogLevel(LogLevel.Debug),
			Effect.withSpan("myspan"),
		);

		ManagedRuntime.make(Parser.Default).runPromise(program);
	});
});

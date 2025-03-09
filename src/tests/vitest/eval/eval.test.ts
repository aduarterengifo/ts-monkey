import { KennethEvalError } from "@/errors/kenneth/eval";
import { defaultLayer } from "@/layers/default";
import { nodeString } from "@/schemas/nodes/union";
import { ArrayObj } from "@/schemas/objs/array";
import { FunctionObj } from "@/schemas/objs/function";
import { Evaluator } from "@/services/evaluator";
import {
	expectBooleanObjEq,
	expectIntObjEq,
	expectStrObjEq,
} from "@/services/expectations/obj/eq";
import { secSquared } from "@/services/math";
import { testIntegerObject, testNullOject } from "@/tests/evaluator/utils";
import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect, Exit, Match, Schema } from "effect";

const evalP = (input: string) =>
	Effect.gen(function* () {
		const evaluator = yield* Evaluator;
		return yield* evaluator.run(input);
	}).pipe(Effect.provide(defaultLayer));

describe("eval", () => {
	describe("IntExp", () => {
		const tests = [
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
		] as const;
		for (const [input, expected] of tests) {
			it.effect(input, () =>
				evalP(input).pipe(
					Effect.flatMap((evaluated) => expectIntObjEq(evaluated, expected)),
				),
			);
		}
	});
	describe("BoolExp", () => {
		const tests = [
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
		] as const;

		for (const [input, expected] of tests) {
			it.effect(input, () =>
				evalP(input).pipe(
					Effect.flatMap((evaluated) =>
						expectBooleanObjEq(evaluated, expected),
					),
				),
			);
		}
	});
	describe("PrefixExp", () => {
		describe("bang operator", () => {
			const tests = [
				["!true", false],
				["!false", true],
				["!5", false],
				["!!true", true],
				["!!false", false],
				["!!5", true],
			] as const;
			for (const [input, expected] of tests) {
				it.effect(input, () =>
					evalP(input).pipe(
						Effect.flatMap((evaluated) =>
							expectBooleanObjEq(evaluated, expected),
						),
					),
				);
			}
		});
	});
	describe("IfExp", () => {
		const tests = [
			["if (true) { 10 }", 10],
			["if (false) { 10 }", null],
			["if (1) { 10 }", 10],
			["if (1 < 2) { 10 }", 10],
			["if (1 > 2) { 10 }", null],
			["if (1 > 2) { 10 } else { 20 }", 20],
			["if (1 < 2) { 10 } else { 20 }", 10],
		] as const;
		for (const [input, expected] of tests) {
			it.effect(input, () =>
				evalP(input).pipe(
					Effect.flatMap((evaluated) =>
						Match.value(expected).pipe(
							Match.when(Match.number, (expected) =>
								expectIntObjEq(evaluated, expected),
							),
							Match.when(Match.null, () => testNullOject(evaluated)),
							Match.exhaustive,
						),
					),
				),
			);
		}
	});
	describe("ReturnExp", () => {
		const tests = [
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
		] as const;

		for (const [input, expected] of tests) {
			it.effect(input, () =>
				evalP(input).pipe(
					Effect.flatMap((evaluated) => expectIntObjEq(evaluated, expected)),
				),
			);
		}
	});
	describe("Error Handling", () => {
		// more or less, not checking the ParseError message.
		describe("Parse Error", () => {
			const tests = [
				["-true", "unknown operator: -BOOLEAN"],
				["foobar", "identifier not found: foobar"],
			] as const;

			for (const [input, expected] of tests) {
				it.effect(input, () =>
					Effect.gen(function* () {
						const result = yield* Effect.exit(evalP(input));

						Exit.match(result, {
							onFailure: (cause) =>
								`Exited with failure state: ${Cause.pretty(cause)}`,
							onSuccess: (value) => expect(true).toBe(false),
						});
					}),
				);
			}
		});
		describe("KennethEvalError", () => {
			const tests = [
				["5 + true;", "type mismatch: IntegerObj + BooleanObj"],
				["5 + true; 5;", "type mismatch: IntegerObj + BooleanObj"],
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
			] as const;

			for (const [input, expected] of tests) {
				it.effect(input, () =>
					Effect.gen(function* () {
						const result = yield* Effect.exit(evalP(input));
						expect(result).toStrictEqual(
							Exit.fail(new KennethEvalError({ message: expected })),
						);
					}),
				);
			}
		});
	});
	describe("LetStmt", () => {
		const tests = [
			["let a = 5; a;", 5],
			["let a = 5 * 5; a;", 25],
			["let a = 5; let b = a; b;", 5],
			["let a = 5; let b = a; let c = a + b + 5; c;", 15],
		] as const;

		for (const [input, expected] of tests) {
			it.effect(input, () =>
				evalP(input).pipe(
					Effect.flatMap((evaluated) => expectIntObjEq(evaluated, expected)),
				),
			);
		}
	});
	describe("CallExp", () => {
		const tests = [
			["let identity = fn(x) { x; }; identity(5);", 5],
			["let identity = fn(x) { return x; }; identity(5);", 5],
			["let double = fn(x) { x * 2; }; double(5);", 10],
			["let add = fn(x, y) { x + y; }; add(5, 5);", 10],
			["let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));", 20],
			["fn(x) { x; }(5)", 5],
			["let add = fn(x, y) { fn (x,y) {x + y}; }; add(5,5)(4,4)", 8],
		] as const;

		for (const [input, expected] of tests) {
			it.effect(input, () =>
				evalP(input).pipe(
					Effect.flatMap((evaluated) => expectIntObjEq(evaluated, expected)),
				),
			);
		}
	});
	describe("BuiltInFunc", () => {
		const tests = [
			['len("")', 0],
			['len("four")', 4],
			['len("hello world")', 11],
			['let hello = fn(x) { "hello" }; len(hello(1))', 5],
			["pi()", Math.PI],
		] as const;

		for (const [input, expected] of tests) {
			it.effect(input, () =>
				evalP(input).pipe(
					Effect.flatMap((evaluated) => expectIntObjEq(evaluated, expected)),
				),
			);
		}
		describe("Error Handling", () => {
			const tests = [
				["len(1)", 'argument to "len" not supported, got IntegerObj'],
				['len("one", "two")', "wrong number of arguments. got=2, want=1"],
			] as const;

			for (const [input, expected] of tests) {
				it.effect(input, () =>
					Effect.gen(function* () {
						const result = yield* Effect.exit(evalP(input));

						Exit.match(result, {
							onFailure: (cause) =>
								`Exited with failure state: ${Cause.pretty(cause)}`,
							onSuccess: (value) => expect(true).toBe(false),
						});
					}),
				);
			}
		});

		describe("math", () => {
			describe("trig", () => {
				const tests = [
					["sin(0)", Math.sin(0)],
					["sin(pi() / 2)", Math.sin(Math.PI / 2)],
					["cos(0)", Math.cos(0)],
					["cos(pi() / 2)", Math.cos(Math.PI / 2)],
					["tan(0)", Math.tan(0)],
					["tan(pi() / 4)", Math.tan(Math.PI / 4)],
				] as const;

				for (const [input, expected] of tests) {
					it.effect(input, () =>
						evalP(input).pipe(
							Effect.flatMap((evaluated) =>
								expectIntObjEq(evaluated, expected),
							),
						),
					);
				}
			});
			describe("log and exp", () => {
				const tests = [
					["ln(0)", Math.log(0)],
					["ln(1)", Math.log(1)],
					["ln(e())", Math.log(Math.E)],
					["exp(e())", Math.exp(Math.E)],
					["exp(1)", Math.exp(1)],
					["ln(exp(3))", Math.log(Math.exp(3))],
				] as const;

				for (const [input, expected] of tests) {
					it.effect(input, () =>
						evalP(input).pipe(
							Effect.flatMap((evaluated) =>
								expectIntObjEq(evaluated, expected),
							),
						),
					);
				}
			});
		});
	});
	describe("Differentiation", () => {
		describe("general", () => {
			const tests = [
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
				["diff(fn(x) { 2 * x ** 3 - (x + 3) })(3)", 53],
			] as const;

			for (const [input, expected] of tests) {
				it.effect(input, () =>
					evalP(input).pipe(
						Effect.flatMap((evaluated) => expectIntObjEq(evaluated, expected)),
					),
				);
			}
		});
		describe("product rule", () => {
			const tests = [
				["diff(fn(x) { (x + 2 * x ** 3) * (x + 1) })(3)", 277],
				[
					"diff(fn(x) { (x + 2 * x ** 3) * (x + 1) + (x + 3 * x ** 3) * (x + 1)  })(3)",
					689,
				],
			] as const;

			for (const [input, expected] of tests) {
				it.effect(input, () =>
					evalP(input).pipe(
						Effect.flatMap((evaluated) => expectIntObjEq(evaluated, expected)),
					),
				);
			}
		});
		describe("quotient rule", () => {
			const tests = [
				["diff(fn(x) { (x + 2 * x ** 3) / (x + 1) })(3)", 163 / 16],
				[
					"diff(fn(x) { (x + 2 * x ** 3) / (x + 1) + (x + 3 * x ** 3) / (x + 1)  })(3)",
					163 / 16 + 61 / 4,
				],
			] as const;

			for (const [input, expected] of tests) {
				it.effect(input, () =>
					evalP(input).pipe(
						Effect.flatMap((evaluated) => expectIntObjEq(evaluated, expected)),
					),
				);
			}
		});
		describe("chain rule", () => {
			const tests = [
				["diff(fn (x) { (3 * x ** 2 + 5 * x) ** 4 })(3)", 6816096],
				["diff(fn (x) { 1 / (2 * x + 3) })(3)", -2 / 81],
				[
					"let f = fn(y) { y ** 4 }; let g = fn(r) { 3 * r ** 2 + 5 }; let h = fn(x) { f(g(x)) };  diff(h)(3)",
					2359296,
				],
				[
					"let f = fn(x) { x ** 4 }; let g = fn(x) { 3 * x ** 2 + 5 }; let h = fn(x) { f(g(x)) };  diff(h)(3)",
					2359296,
				],
			] as const;

			for (const [input, expected] of tests) {
				it.effect(input, () =>
					evalP(input).pipe(
						Effect.flatMap((evaluated) => expectIntObjEq(evaluated, expected)),
					),
				);
			}
		});
		describe("trig", () => {
			const tests = [
				["diff(fn(x) {sin(x)})(0)", Math.cos(0)],
				["diff(fn(x) {sin(x)})(pi() / 2)", Math.cos(Math.PI / 2)],
				["diff(fn(x) {cos(x)})(0)", -Math.sin(0)],
				["diff(fn(x) {cos(x)})(pi() / 2)", -Math.sin(Math.PI / 2)],
				["diff(fn(x) {tan(x)})(0)", secSquared(0)],
				["diff(fn(x) {tan(x)})(pi() / 4)", secSquared(Math.PI / 4)],
			] as const;

			for (const [input, expected] of tests) {
				it.effect(input, () =>
					evalP(input).pipe(
						Effect.flatMap((evaluated) => expectIntObjEq(evaluated, expected)),
					),
				);
			}
		});
		describe("log and exp", () => {
			const tests = [
				["diff(fn(x) {ln(x)})(1)", 1 / 1],
				["diff(fn(x) {exp(x)})(1)", Math.E],
			] as const;

			for (const [input, expected] of tests) {
				it.effect(input, () =>
					evalP(input).pipe(
						Effect.flatMap((evaluated) => expectIntObjEq(evaluated, expected)),
					),
				);
			}
		});
	});
	describe("string concatenation", () => {
		const tests = [['"Hello" + " " + "World!"', "Hello World!"]] as const;
		for (const [input, expected] of tests) {
			it.effect(input, () =>
				evalP(input).pipe(
					Effect.flatMap((evaluated) => expectStrObjEq(evaluated, expected)),
				),
			);
		}
	});
	describe("IndexExp", () => {
		describe("general", () => {
			const tests = [
				["[1, 2, 3][0]", 1],
				["[1, 2, 3][1]", 2],
				["[1, 2, 3][2]", 3],
				["let i = 0; [1][i];", 1],
				["[1, 2, 3][1 + 1];", 3],
				["let myArray = [1, 2, 3]; myArray[2];", 3],
				["let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];", 6],
				["let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i]", 2],
			] as const;
			for (const [input, expected] of tests) {
				it.effect(input, () =>
					evalP(input).pipe(
						Effect.flatMap((evaluated) =>
							Match.value(expected).pipe(
								Match.when(Match.number, (expected) =>
									expectIntObjEq(evaluated, expected),
								),
								Match.when(Match.null, () => testNullOject(evaluated)),
								Match.exhaustive,
							),
						),
					),
				);
			}
		});
		describe("out of range error handling", () => {
			const tests = [
				["[1, 2, 3][3]", null],
				["[1, 2, 3][-1]", null],
			] as const;
			for (const [input, expected] of tests) {
				it.effect(input, () =>
					Effect.gen(function* () {
						const result = yield* Effect.exit(evalP(input));

						Exit.match(result, {
							onFailure: (cause) =>
								`Exited with failure state: ${Cause.pretty(cause)}`,
							onSuccess: (value) => expect(true).toBe(false),
						});
					}),
				);
			}
		});
	});

	it.effect("FunctionObj", () =>
		evalP("fn(x) { x+ 2}").pipe(
			Effect.flatMap((evaluated) =>
				Effect.gen(function* () {
					const { params, body } =
						yield* Schema.decodeUnknown(FunctionObj)(evaluated);
					expect(params.length).toBe(1);
					expect(nodeString(params[0])).toBe("x");
					expect(nodeString(body)).toBe("(x + 2)");
				}),
			),
		),
	);
	it.effect("Closures", () =>
		evalP(`
		let newAdder = fn(x) {
		  fn(y) { x + y };
		};

		let addTwo = newAdder(2);
		addTwo(2);
		`).pipe(Effect.flatMap((evaluated) => expectIntObjEq(evaluated, 4))),
	);
	it.effect("StrExp", () =>
		evalP('"Hello World!"').pipe(
			Effect.flatMap((evaluated) => expectStrObjEq(evaluated, "Hello World!")),
		),
	);
	it.effect("ArrayExp", () =>
		evalP("[1, 2 * 2, 3 + 3]").pipe(
			Effect.flatMap((evaluated) =>
				Effect.gen(function* () {
					const arrayObj = yield* Schema.decodeUnknown(ArrayObj)(evaluated);

					expect(arrayObj.elements.length).toBe(3);

					yield* expectIntObjEq(arrayObj.elements[0], 1);
					yield* expectIntObjEq(arrayObj.elements[1], 4);
					yield* expectIntObjEq(arrayObj.elements[2], 6);
				}),
			),
		),
	);
});

import { defaultLayer } from "@/layers/default";
import { BoolExp } from "@/schemas/nodes/exps/boolean";
import { nativeToIdentExp } from "@/schemas/nodes/exps/ident";
import { IfExp } from "@/schemas/nodes/exps/if";
import { IntExp } from "@/schemas/nodes/exps/int";
import { Program } from "@/schemas/nodes/program";
import { ExpStmt } from "@/schemas/nodes/stmts/exp";
import { LetStmt } from "@/schemas/nodes/stmts/let";
import { nodeString } from "@/schemas/nodes/union";
import { TokenType } from "@/schemas/token-types/union";
import {
	expectBooleanExpEq,
	expectIdentExpEq,
	expectIntExpEq,
} from "@/services/expectations/exp/eq";
import { Parser } from "@/services/parser";
import { testBoolExp } from "@/tests/parser/utils/test-bool-exp";
import { testIdentExp } from "@/tests/parser/utils/test-identifier";
import { testInfixExp } from "@/tests/parser/utils/test-infix-expression";
import { testIntExp } from "@/tests/parser/utils/test-int-exp";
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
			const exp = yield* getExpFromProgram(`if (x ${TokenType.LT} y) { x }`);
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
			const exp = yield* getExpFromProgram("if (x < y) { x } else { y }");
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
});

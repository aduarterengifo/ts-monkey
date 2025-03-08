import { ConstantExp } from "@/schemas/nodes/exps/unions/constant";
import { Effect, Schema } from "effect";
import { KennethParseError } from "src/errors/kenneth/parse";
import { InfixExp } from "src/schemas/nodes/exps/infix";
import type { Exp } from "src/schemas/nodes/exps/union";
import { testLiteralExpression } from "./test-literal-expression";

export const testInfixExp = (
	exp: Exp,
	left: string | number | boolean,
	operator: string,
	right: string | number | boolean,
) =>
	Effect.gen(function* () {
		const infixExp = yield* Schema.decodeUnknown(InfixExp)(exp);
		yield* testLiteralExpression(infixExp.left, left);

		if (infixExp.operator !== operator) {
			return yield* new KennethParseError({
				message: `Expected exp.operator to be ${operator}, got ${infixExp.operator} instead.`,
			});
		}
		yield* testLiteralExpression(infixExp.right, right);

		return true;
	});

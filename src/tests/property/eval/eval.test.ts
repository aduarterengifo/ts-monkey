import { infixOperatorSchema } from "@/schemas/infix-operator";
import { BooleanObj } from "@/schemas/objs/bool";
import { IntegerObj } from "@/schemas/objs/int";
import { Evaluator } from "@/services/evaluator";
import { OPERATOR_TO_FUNCTION_MAP } from "@/services/evaluator/constants";
import { it } from "@effect/vitest";
import { Effect, Schema } from "effect";

// Testing a successful division
it.prop(
	"prefix operator",
	[Schema.Number, infixOperatorSchema, Schema.Number],
	([left, operator, right]) =>
		Effect.gen(function* () {
			const evaluator = yield* Evaluator;
			const evaluation = yield* evaluator.run(`${left} ${operator} ${right}`);
			const { value } = yield* Schema.decodeUnknown(
				Schema.Union(IntegerObj, BooleanObj),
			)(evaluation);
			const jsValue = OPERATOR_TO_FUNCTION_MAP[operator](left, right);
			if (value !== jsValue) throw new Error("Invalid on age");
		}),
);

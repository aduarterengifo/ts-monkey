import { defaultLayer } from "@/layers/default";
import { infixOperatorSchema } from "@/schemas/infix-operator";
import { BooleanObj } from "@/schemas/objs/bool";
import { IntegerObj } from "@/schemas/objs/int";
import { prefixOperatorSchema } from "@/schemas/prefix-operator";
import { OPERATOR_TO_FUNCTION_MAP } from "@/services/evaluator/constants";
import { describe, expect, it, layer } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { evalP } from "../utils/eval";

describe("prefix operator", () => {
	layer(defaultLayer)((it) => {
		it.effect.prop(
			"prefix operator",
			[
				Schema.Number.pipe(Schema.int()),
				infixOperatorSchema,
				Schema.Number.pipe(Schema.int()),
			],
			([left, operator, right]) =>
				evalP(`${left} ${operator} ${right}`).pipe(
					Effect.flatMap((evaluated) =>
						Effect.gen(function* () {
							const { value } = yield* Schema.decodeUnknown(
								Schema.Union(IntegerObj, BooleanObj),
							)(evaluated);
							yield* Effect.logDebug("value", value);
							const jsValue = OPERATOR_TO_FUNCTION_MAP[operator](left, right);
							yield* Effect.logDebug("jsValue", jsValue);
							expect(value).toBe(jsValue);
						}),
					),
				),
			{ fastCheck: { numRuns: 200 } },
		);
	});
});

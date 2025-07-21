import { defaultLayer } from "@/layers/default";
import { infixOperatorSchema } from "@/schemas/infix-operator";
import { BooleanObj } from "@/schemas/objs/bool";
import { IntegerObj } from "@/schemas/objs/int";
import { prefixOperatorSchema } from "@/schemas/prefix-operator";
import {
	OPERATOR_TO_FUNCTION_MAP,
	PREFIX_OPERATOR_TO_FUNCTION_MAP,
} from "@/services/evaluator/constants";
import { describe, expect, it, layer } from "@effect/vitest";
import { Effect, Match, Schema } from "effect";
import { evalP } from "../utils/eval";

describe("property", () => {
	layer(defaultLayer)((it) => {
		// TODO: cover non-integer cases
		it.effect.prop(
			"Integer InfixExp",
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
							const jsValue = OPERATOR_TO_FUNCTION_MAP[operator](left, right);
							expect(value).toBe(jsValue);
						}),
					),
				),
			{ fastCheck: { numRuns: 200 } },
		);
		// TODO: should fail on trying to negate anything that is not an integer.
		// in monkey !int is always false.
		it.effect.prop(
			"PrefixExp",
			[prefixOperatorSchema, Schema.Number.pipe(Schema.int())],
			([operator, right]) =>
				evalP(`${operator}${right}`).pipe(
					Effect.flatMap((evaluated) =>
						Effect.gen(function* () {
							const { value } = yield* Schema.decodeUnknown(
								Schema.Union(IntegerObj, BooleanObj),
							)(evaluated);

							const jsValue = PREFIX_OPERATOR_TO_FUNCTION_MAP[operator](right);
							expect(value).toBe(jsValue);
						}),
					),
				),
			{ fastCheck: { numRuns: 200 } },
		);
		// describe("ArrayObj", () => {
		// 	it.effect.prop("first", [ArrayObj], ([array]) =>
		// 		Effect.gen(function* () {
		// 			const input = `first(${objInspect(array)})`;
		// 			yield* Effect.log(input);
		// 			const ev = yield* evalP(input);
		// 		}),
		// 	);
		// });
	});
});

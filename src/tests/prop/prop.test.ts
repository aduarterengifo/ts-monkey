import { defaultLayer } from "@/layers/default";
import { describe, it, layer } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { evalP } from "../vitest/utils/eval";

describe("prefix operator", () => {
	layer(defaultLayer)((it) => {
		it.prop(
			"prefix operator",
			[
				Schema.Number.pipe(Schema.int()),
				Schema.Literal("+"),
				Schema.Number.pipe(Schema.int()),
			],
			([left, operator, right]) =>
				evalP(`${left} ${operator} ${right}`).pipe(
					// Effect.succeed(4).pipe(
					Effect.flatMap((evaluated) =>
						Effect.gen(function* () {
							// const { value } = yield* Schema.decodeUnknown(
							// 	Schema.Union(IntegerObj, BooleanObj),
							// )(evaluated);
							// yield* Effect.logDebug("value", value);
							// const jsValue = OPERATOR_TO_FUNCTION_MAP[operator](left, right);
							// yield* Effect.logDebug("jsValue", jsValue);
							return yield* Effect.succeed(true);
						}),
					),
					Effect.catchAll((error) => {
						console.error(
							`Failed with input [${left}, "${operator}", ${right}]:`,
							error,
						);
						return Effect.fail(error);
					}),
				),
			{ fastCheck: { verbose: 2 } },
		);
	});
});

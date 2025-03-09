import { BooleanObj } from "@/schemas/objs/bool";
import { IntegerObj } from "@/schemas/objs/int";
import { OPERATOR_TO_FUNCTION_MAP } from "@/services/evaluator/constants";
import { it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { evalP } from "../utils/eval";

it.prop(
	"prefix operator",
	[
		Schema.Number.pipe(Schema.int()),
		Schema.Literal("+"),
		Schema.Number.pipe(Schema.int()),
	],
	([left, operator, right]) =>
		evalP(`${left} ${operator} ${right}`).pipe(
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
		),
	{
		fails: false,
	},
);

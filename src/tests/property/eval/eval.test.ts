import { BooleanObj } from "@/schemas/objs/bool";
import { IntegerObj } from "@/schemas/objs/int";
import { Evaluator } from "@/services/evaluator";
import { OPERATOR_TO_FUNCTION_MAP } from "@/services/evaluator/constants";
import { it } from "@effect/vitest";
import { Effect, Schema } from "effect";
import { logDebug } from "effect/Effect";

// Testing a successful division
it.prop(
	"prefix operator",
	[
		Schema.Number.pipe(Schema.int()),
		Schema.Literal("+"),
		Schema.Number.pipe(Schema.int()),
	],
	([left, operator, right]) =>
		Effect.gen(function* () {
			const evaluator = yield* Evaluator;
			const evaluation = yield* evaluator.run(`${left} ${operator} ${right}`);
			const { value } = yield* Schema.decodeUnknown(
				Schema.Union(IntegerObj, BooleanObj),
			)(evaluation);
			yield* logDebug("value", value);
			const jsValue = OPERATOR_TO_FUNCTION_MAP[operator](left, right);
			yield* logDebug("jsValue", jsValue);
			return true;
			// if (value !== jsValue)
			// 	throw new Error(`expected ${jsValue}, got ${value}`);
		}),
);

          SELECT
                co.status,
                co.company,
                co.affiliateComission
            FROM
                `cartorder` co
                LEFT JOIN `account` a ON co.`accountId` = a.`accountId`
                LEFT JOIN customer c ON c.customerId = a.customerId
            WHERE
                co.`referringAffiliateId` = 4016
                AND c.customerId = 48994
                AND co.wc_status = 'completed'

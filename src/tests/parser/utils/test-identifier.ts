import { nodeString, tokenLiteral } from "@/schemas/nodes/union";
import { Effect } from "effect";
import { KennethParseError } from "src/errors/kenneth/parse";
import type { Exp } from "src/schemas/nodes/exps/union";
import { isIdentExpression } from "src/services/ast";

export const testIdentifier = (expression: Exp, value: string) =>
	Effect.gen(function* () {
		return yield* !isIdentExpression(expression)
			? new KennethParseError({
					message: `Expected expression to be IdentExpression got ${nodeString(expression)}`,
				})
			: expression.value !== value
				? new KennethParseError({
						message: `Expected identExpression.Value to be ${value}, got ${expression.value}`,
					})
				: tokenLiteral(expression) !== value
					? new KennethParseError({
							message: `Expected ident.TokenLiteral to be ${value}, got ${tokenLiteral(expression)}`,
						})
					: Effect.succeed(true);
	});

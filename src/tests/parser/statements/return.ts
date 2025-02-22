import { KennethParseError } from "@/errors/kenneth/parse";
import type { Stmt } from "@/schemas/nodes/stmts/union";
import { tokenLiteral } from "@/schemas/nodes/union";
import { isReturnStatement } from "@/services/ast";
import { Effect, Match } from "effect";

export const testReturnStatement = (statement: Stmt, name: string) =>
	Effect.gen(function* () {
		return yield* Match.value(statement).pipe(
			Match.when(
				(statement) => tokenLiteral(statement) !== "return",
				function* () {
					return yield* new KennethParseError({
						message: `expected tokenLiteral(statement) to be return instead got ${tokenLiteral(statement)}`,
					});
				},
			),
			Match.when(
				(statement) => !isReturnStatement(statement),
				function* () {
					return yield* new KennethParseError({
						message: "expected statement to be return statement",
					});
				},
			),
			Match.orElse(function* () {
				return yield* Effect.succeed(true);
			}),
		);
	});

import { ExpStmt } from "@/schemas/nodes/stmts/exp";
import { Parser } from "@/services/parser";
import { Effect, Schema } from "effect";

export const getExpFromProgram = (input: string, optimized = false) =>
	Effect.gen(function* () {
		const parser = yield* Parser;
		yield* parser.init(input);

		const program = optimized
			? yield* parser.parseProgramOptimized
			: yield* parser.parseProgram;

		const [{ expression }] = yield* Schema.decodeUnknown(Schema.Tuple(ExpStmt))(
			program.statements,
		);
		return expression;
	});

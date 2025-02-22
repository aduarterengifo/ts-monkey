import { nodeString } from "@/schemas/nodes/union";
import { Console, Effect } from "effect";
import { Schema } from "effect";
import { nativeToExp } from "src/schemas/nodes/exps/union";
import { ReturnStmt } from "src/schemas/nodes/stmts/return";
import {
	type Stmt,
	isExpStmt,
	Stmt,
} from "src/schemas/nodes/stmts/union";

const program = Effect.gen(function* () {
	const istmt = nativeToExp(6);
	const rstmt = ReturnStmt.make({
		token: { _tag: "let", literal: "let" },
		value: istmt,
	}) as Stmt;
	yield* Console.log(Schema.decodeUnknownSync(Stmt)(rstmt));

	if (isExpStmt(rstmt)) {
		console.log(`${nodeString(rstmt)}`);
	}
}).pipe(
	Effect.withSpan("program", {
		attributes: { source: "Playground" },
	}),
);

Effect.runSync(program);

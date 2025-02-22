import { Data, Match } from "effect";
import type { Exp } from "./exps/union";
import type { Program } from "./program";
import type { Stmt } from "./stmts/union";

export type KNode = Exp | Stmt | Program;

export const { $is: isKNode, $match: matchKnode } = Data.taggedEnum<KNode>();

export const tokenLiteral = (node: KNode) =>
	Match.value(node).pipe(
		Match.tag("Program", (program) =>
			program.statements.length > 0 ? program.statements[0].token.literal : "",
		),
		Match.orElse(() => `${node.token.literal}`),
	);

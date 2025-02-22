import { Data, Match, Pretty, Schema } from "effect";
import { type Exp, type ExpEncoded, expSchema } from "./exps/union";
import { Program } from "./program";

import { type Stmt, type StmtEncoded, stmtSchema } from "./stmts/union";

export type KNode = Exp | Stmt | Program;

export type KNodeEncoded = ExpEncoded | StmtEncoded;

export const kNodeSchema = Schema.Union(expSchema, stmtSchema, Program);

export const { $is: isKNode, $match: matchKnode } = Data.taggedEnum<KNode>();

export const tokenLiteral = (node: KNode) =>
	Match.value(node).pipe(
		Match.tag("Program", (program) =>
			program.statements.length > 0 ? program.statements[0].token.literal : "",
		),
		Match.orElse(() => `${node.token.literal}`),
	);

export const prettyNode = Pretty.make(kNodeSchema);

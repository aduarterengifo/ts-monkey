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
			program.statements.length > 0
				? `${program.statements[0].token.literal}`
				: "",
		),
		Match.orElse(() => `${node.token.literal}`),
	);

export const prettyNode = Pretty.make(kNodeSchema);

export const nodeString = (node: KNode): string =>
	Match.value(node).pipe(
		Match.tag(
			"CallExp",
			(callExp) =>
				`${nodeString(callExp.fn)}(${callExp.args.map((arg) => nodeString(arg)).join(", ")})`,
		),
		Match.tag(
			"FuncExp",
			(funcExp) => `
			${funcExp.token.literal}
			(
			${funcExp.parameters.map((param) => nodeString(param)).join(", ")}
			)
			${nodeString(funcExp.body)}
			`,
		),
		Match.tag("IfExp", (ifExp) => {
			const res: string = `
			if
			${nodeString(ifExp.condition)}

			${nodeString(ifExp.consequence)}
			`;
			return ifExp.alternative
				? `${res}
				else
				${nodeString(ifExp.alternative)}
				`
				: res;
		}),
		Match.tag(
			"InfixExp",
			(infixExp) =>
				`(${nodeString(infixExp.left)} ${infixExp.operator} ${nodeString(infixExp.right)})`,
		),
		Match.tag(
			"PrefixExp",
			(prefixExp) => `(${prefixExp.operator}${nodeString(prefixExp.right)})`,
		),
		Match.tag("IdentExp", (identExp) => identExp.value),
		Match.tag("BlockStmt", (blockStmt) =>
			blockStmt.statements.map((stmt) => nodeString(stmt)).join("\n"),
		),
		Match.tag("ExpStmt", (expStmt) => nodeString(expStmt.expression)),
		Match.tag(
			"LetStmt",
			(letStmt) =>
				`${letStmt.token.literal} ${nodeString(letStmt.name)} = ${nodeString(letStmt.value)};`,
		),
		Match.tag(
			"ReturnStmt",
			(returnStmt) =>
				`${returnStmt.token.literal} ${nodeString(returnStmt.value)};`,
		),
		Match.tag("Program", (program) =>
			program.statements.map((statement) => nodeString(statement)).join(""),
		),
		Match.orElse(() => tokenLiteral(node)),
	);

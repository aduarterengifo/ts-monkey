import { Schema } from "effect";
import { type IfToken, ifTokenSchema } from "src/schemas/token/if";
import type { INode } from "../interfaces/internal-node";
import { BlockStmt, type BlockStmtEncoded } from "../stmts/block";
import { type Exp, type ExpEncoded, expSchema } from "./union";

export type IfExpEncoded = {
	readonly _tag: "IfExp";
	readonly token: IfToken;
	readonly condition: ExpEncoded;
	readonly consequence: BlockStmtEncoded;
	readonly alternative?: BlockStmtEncoded | undefined;
};

export class IfExp
	extends Schema.TaggedClass<IfExp>()("IfExp", {
		token: ifTokenSchema,
		condition: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => expSchema),
		consequence: BlockStmt,
		alternative: Schema.optional(BlockStmt),
	})
	implements INode
{
	string() {
		const res: string = `
			if
			${this.condition.string()}

			${this.consequence.string()}
			`;
		return this.alternative
			? `${res}
				else
				${this.alternative.string()}
				`
			: res;
	}
}

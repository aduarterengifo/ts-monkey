import { Data, Schema } from "effect";
import { BlockStmt } from "./block";
import { ExpStmt } from "./exp";
import { LetStmt } from "./let";
import { ReturnStmt } from "./return";

export type Stmt = BlockStmt | ExpStmt | LetStmt | ReturnStmt;

export const stmtSchema = Schema.suspend(
	(): Schema.Schema<Stmt> =>
		Schema.Union(BlockStmt, ExpStmt, LetStmt, ReturnStmt),
);

export const { $is: isStmt, $match: matchStmt } = Data.taggedEnum<Stmt>();

export const isBlockStmt = isStmt("BlockStmt");
export const isExpStmt = isStmt("ExpStmt");
export const isLetStmt = isStmt("LetStmt");
export const isReturnStmt = isStmt("ReturnStmt");

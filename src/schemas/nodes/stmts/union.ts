import { Data, Schema } from 'effect'
import { BlockStmt, type BlockStmtEncoded } from './block'
import { ExpStmt, type ExpStmtEncoded } from './exp'
import { LetStmt, type LetStmtEncoded } from './let'
import { ReturnStmt, type ReturnStmtEncoded } from './return'

export type Stmt = BlockStmt | ExpStmt | LetStmt | ReturnStmt

export type StmtEncoded =
	| BlockStmtEncoded
	| ExpStmtEncoded
	| LetStmtEncoded
	| ReturnStmtEncoded

export const stmtSchema = Schema.suspend(
	(): Schema.Schema<Stmt, StmtEncoded> =>
		Schema.Union(BlockStmt, ExpStmt, LetStmt, ReturnStmt),
)

export const { $is: isStmt, $match: matchStmt } = Data.taggedEnum<Stmt>()

export const isBlockStmt = isStmt('BlockStmt')
export const isExpStmt = isStmt('ExpStmt')
export const isLetStmt = isStmt('LetStmt')
export const isReturnStmt = isStmt('ReturnStmt')

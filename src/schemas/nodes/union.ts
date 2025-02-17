import { Data } from 'effect'
import type { Exp } from './exps/union'
import type { Stmt } from './stmts/union'
import type { Program } from './program'

export type KNode = Exp | Stmt | Program

export const { $is: isKNode, $match: matchKnode } = Data.taggedEnum<KNode>()

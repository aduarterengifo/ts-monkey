import type { Exp } from 'src/schemas/nodes/exps/union'

export type PrefixParseFunction = () => Exp
export type InfixParseFunction = (exp: Exp) => Exp

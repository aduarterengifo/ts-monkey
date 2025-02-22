import { Schema } from 'effect'
import { IdentExp, IdentExpEncoded } from '../nodes/exps/ident'

export interface IdentObj {
	readonly _tag: 'IdentObj'
    readonly identExp: IdentExp
}

export interface IdentObjEncoded  {
	readonly _tag: 'IdentObj'
    readonly identExp: IdentExpEncoded
}

export const identObjSchema = Schema.TaggedStruct('IdentObj', {
    identExp: Schema.suspend((): Schema.Schema<IdentExp, IdentExpEncoded> => IdentExp)
	
})

export const identObjEq = Schema.equivalence(identObjSchema)

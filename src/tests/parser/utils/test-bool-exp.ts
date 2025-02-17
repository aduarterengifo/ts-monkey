import { Effect } from 'effect'
import { KennethParseError } from 'src/errors/kenneth/parse'
import { BoolExpEq, type BoolExp } from 'src/schemas/nodes/exps/boolean'
import { nativeToExp } from 'src/schemas/nodes/exps/union'

export const testBoolExp = (boolExp: BoolExp, value: boolean) =>
	Effect.gen(function* () {
		return !BoolExpEq(boolExp, nativeToExp(value))
			? yield* new KennethParseError({
					message: `boolExp not equal ${boolExp.value} !== ${value}`,
				})
			: undefined
	})

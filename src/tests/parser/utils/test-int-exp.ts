import { Effect } from 'effect'
import { KennethParseError } from 'src/errors/kenneth/parse'
import {
	IntExpEq,
	nativeToIntExp,
	type IntExp,
} from 'src/schemas/nodes/exps/int'

export const testIntExp = (intExp: IntExp, value: number) =>
	Effect.gen(function* () {
		return !IntExpEq(intExp, nativeToIntExp(value))
			? yield* new KennethParseError({
					message: `intExp not equal ${intExp.value} !== ${value}`,
				})
			: undefined
	})

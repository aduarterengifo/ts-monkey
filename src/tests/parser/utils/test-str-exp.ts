import { Effect } from 'effect'
import { KennethParseError } from 'src/errors/kenneth/parse'
import { StrExpEq, type StrExp } from 'src/schemas/nodes/exps/str'
import { nativeToExp } from 'src/schemas/nodes/exps/union'

export const testStrExp = (strExp: StrExp, value: string) =>
	Effect.gen(function* () {
		return !StrExpEq(strExp, nativeToExp(value))
			? yield* new KennethParseError({
					message: `strExp not equal ${strExp.value} !== ${value}`,
				})
			: undefined
	})

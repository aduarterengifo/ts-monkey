import { Effect, Match } from 'effect'
import { KennethParseError } from 'src/errors/kenneth/parse'
import { BoolExpEq, type BoolExp } from 'src/schemas/nodes/exps/boolean'
import { IntExpEq, type IntExp } from 'src/schemas/nodes/exps/int'
import { StrExpEq, type StrExp } from 'src/schemas/nodes/exps/str'
import { nativeToExp } from 'src/schemas/nodes/exps/union'

export const testLiteralExpression = (
	exp: IntExp | StrExp | BoolExp,
	value: string | number | boolean,
) =>
	Effect.gen(function* () {
		return !Match.value(exp).pipe(
			Match.tag('StrExp', (strExp) => StrExpEq(strExp, nativeToExp(value))),
			Match.tag('IntExp', (intExp) => IntExpEq(intExp, nativeToExp(value))),
			Match.tag('BoolExp', (boolExp) => BoolExpEq(boolExp, nativeToExp(value))),
		)
			? yield* new KennethParseError({
					message: `${exp._tag} not equal ${exp.value} !== ${value}`,
				})
			: undefined
	})

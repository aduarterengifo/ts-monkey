import { IdentExp, IdentExpEq, nativeToIdentExp } from '@/schemas/nodes/exps/ident'
import { Effect, Match } from 'effect'
import { KennethParseError } from 'src/errors/kenneth/parse'
import { BoolExpEq, nativeToBoolExp, type BoolExp } from 'src/schemas/nodes/exps/boolean'
import { IntExpEq, nativeToIntExp, type IntExp } from 'src/schemas/nodes/exps/int'
import { nativeToStrExp, StrExpEq, type StrExp } from 'src/schemas/nodes/exps/str'

export const testLiteralExpression = (
	exp: IntExp | StrExp | BoolExp | IdentExp,
	value: string | number | boolean,
) => Effect.fail(
		new KennethParseError({
			message: `${exp._tag} not equal ${exp.value} !== ${value}`,
		})
	)
	.pipe(Effect.when(() => !Match.value(exp).pipe(
			Match.tag('StrExp', (strExp) => StrExpEq(strExp, nativeToStrExp(value as string))), // TODO: cheating
			Match.tag('IntExp', (intExp) => IntExpEq(intExp, nativeToIntExp(value as number))),
			Match.tag('BoolExp', (boolExp) => BoolExpEq(boolExp, nativeToBoolExp(value as boolean))),
			Match.tag('IdentExp', (identExp) => IdentExpEq(identExp, nativeToIdentExp(value as string)))
		) ))
	
// this function is kinda ass?

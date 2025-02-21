import { NULL } from '@/schemas/objs/null'
import { Obj, prettyObj } from '@/schemas/objs/union'
import { Effect, Match } from 'effect'
import { KennethParseError } from 'src/errors/kenneth/parse'

export const testIntegerObject = (obj: Obj, expected: number) =>
	Match.value(obj).pipe(
		Match.tag('IntegerObj', (intObj) =>
			Effect.fail(
				new KennethParseError({
					message: `expect obj.value to be ${expected}. got ${intObj.value}`,
				}),
			).pipe(Effect.when(() => intObj.value !== expected)),
		),
		Match.orElse(() =>
			Effect.fail(
				new KennethParseError({
					message: `obj is not an IntegerObj. got ${obj._tag}`,
				}),
			),
		),
	)

export const testStringObject = (obj: Obj, expected: string) =>
	Match.value(obj).pipe(
		Match.tag('StringObj', (stringObj) =>
			Effect.fail(
				new KennethParseError({
					message: `expect obj.value to be ${expected}. got ${stringObj.value}`,
				}),
			).pipe(Effect.when(() => stringObj.value !== expected)),
		),
		Match.orElse(() =>
			Effect.fail(
				new KennethParseError({
					message: `obj is not a string. got ${obj._tag}`,
				}),
			),
		),
	)

export const testBooleanObject = (obj: Obj, expected: boolean) =>
	Match.value(obj).pipe(
		Match.tag('BooleanObj', (booleanObj) =>
			Effect.fail(
				new KennethParseError({
					message: `expect obj.value to be ${expected}. got ${booleanObj.value}`,
				}),
			).pipe(Effect.when(() => booleanObj.value !== expected)),
		),
		Match.orElse(() =>
			Effect.fail(
				new KennethParseError({
					message: `obj is not a boolean. got ${obj._tag}`,
				}),
			),
		),
	)

export const testNullOject = (obj: Obj) =>
	Effect.gen(function* () {
		if (obj !== NULL) {
			return yield* new KennethParseError({
				message: `obj is not NULL. got ${prettyObj(obj)}`,
			})
		}
		return true
	})

export const testErrorObject = (obj: Obj, expected: string) =>
	Match.value(obj).pipe(
		Match.tag('ErrorObj', (errObj) => Effect.if(errObj.message === expected, {
			onTrue: () => Effect.succeed(true),
			onFalse: () => Effect.fail(new KennethParseError({
			message: `expect obj.message to be ${expected}. got ${errObj.message}`,
		}))
		})),
		Match.orElse(() => Effect.fail(new  KennethParseError({
			message: `obj is not an ErrorObj. got ${JSON.stringify(obj)}`,
		})))
	)
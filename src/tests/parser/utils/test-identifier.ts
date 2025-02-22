import { expectIdentEquivalence, nativeToIdentExp } from '@/schemas/nodes/exps/ident'
import { Effect, Match } from 'effect'
import { KennethParseError } from 'src/errors/kenneth/parse'
import type { Exp } from 'src/schemas/nodes/exps/union'

export const testIdentifier = (expression: Exp, value: string) => 
	Match.value(expression).pipe(
		Match.tag('IdentExp', (identExp) => 
			expectIdentEquivalence(identExp, nativeToIdentExp(value))
		),
		Match.orElse(() => Effect.fail(new KennethParseError({
					message: `Expected expression to be IdentExpression got ${expression.string()}`, // string should be replaced by pretty
				}))) // doing this by hand sucksssss
	)


export 
import type { IdentExp } from '../ident'
import { InfixExp } from '../infix'
import { nativeToIntExp } from '../int'

export const newTerm = (coeff: number, x: IdentExp, power: number) =>
	new InfixExp({
		token: { _tag: '*', literal: '*' },
		left: nativeToIntExp(coeff),
		operator: '*',
		right: new InfixExp({
			token: { _tag: '*', literal: '*' },
			left: x,
			operator: '**',
			right: nativeToIntExp(power),
		}),
	})

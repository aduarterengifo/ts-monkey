import { Effect, Schema } from 'effect'
import type { Obj } from '.'
import type { KennethEvalError } from 'src/errors/kenneth/eval'
import { builtins, builtinsKeySchema } from './builtins'
import type { ParseError } from 'effect/ParseResult'

// this should also be a class/service

export const get = (env: Environment) => (key: string) => Effect.gen(function* () {
			return (
				env.store.get(key) ??
				(env.outer
					? yield* env.outer.get(key)
					: builtins[yield* Schema.decodeUnknown(builtinsKeySchema)(key)])
			)
		})

export const set = (env: Environment) => (key: string, value: Obj) => {
	env.store.set(key, value)
	return value
}

export type Environment = {
	store: Map<string, Obj>
	outer: Environment | undefined
	get: (key: string) => Effect.Effect<Obj, ParseError | KennethEvalError, never>
	set: (key: string, value: Obj) => Obj
}

export const createEnvironment = (
	outer?: Environment | undefined,
): Environment => ({
	store: new Map<string, Obj>(),
	outer,
	get: function (key: string) {
		const store = this.store
		return Effect.gen(function* () {
			return (
				store.get(key) ??
				(outer
					? yield* outer.get(key)
					: builtins[yield* Schema.decodeUnknown(builtinsKeySchema)(key)])
			)
		})
	},
	set: function (key: string, value: Obj) {
		this.store.set(key, value)
		return value
	},
})

export const printStore = (env: Environment): string => {
	let output = 'Environment Store:\n'
	env.store.forEach((value, key) => {
		output += `${key}: ${value}\n`
	})

	if (env.outer) {
		output += '\nOuter Environment:\n'
		output += printStore(env.outer)
	}

	return output
}

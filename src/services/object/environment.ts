import { Effect, Schema } from 'effect'
import { builtins, builtinsKeySchema } from './builtins'
import { Obj, ObjEncoded, objSchema } from '@/schemas/objs/union'
import { ParseError } from 'effect/ParseResult'
import { KennethEvalError } from '@/errors/kenneth/eval'

// this should also be a class/service

export const get = (env: Environment) => (key: string): Effect.Effect<Obj, ParseError| KennethEvalError, never> => Effect.gen(function* () {
			return (
				env.store.get(key) ??
				(env.outer
					? yield* get(env.outer)(key)
					: builtins[yield* Schema.decodeUnknown(builtinsKeySchema)(key)])
			)
		})

export const set = (env: Environment) => (key: string, value: Obj) => {
	env.store.set(key, value)
	return value
}


export interface Environment {
  readonly outer: Environment | undefined
  readonly store: Map<string, Obj>
}

export interface EnvironmentEncoded {
  readonly outer: EnvironmentEncoded | undefined
  readonly store: Map<string, ObjEncoded>
}


export const environmentSchema = Schema.Struct({
	store: Schema.suspend((): Schema.Schema<Map<string, Obj>, Map<string, ObjEncoded>> => Schema.Map({key: Schema.String, value: objSchema})),
	outer: Schema.Union(Schema.suspend((): Schema.Schema<Environment, EnvironmentEncoded> => environmentSchema), Schema.Undefined)
})

// export type Environment = {
// 	store: Map<string, Obj>
// 	outer: Environment | undefined
// }

export const createEnvironment = (
	outer?: Environment | undefined,
): Environment => ({
	store: new Map<string, Obj>(),
	outer,
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

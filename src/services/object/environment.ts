import { Obj } from "@/schemas/objs/union";
import { Effect, Schema } from "effect";
import type { ParseError } from "effect/ParseResult";
import { objInspect } from ".";
import { builtins, builtinsKeySchema } from "./builtins";

export const get =
	(env: Environment) =>
	(key: string): Effect.Effect<Obj, ParseError, never> =>
		Effect.gen(function* () {
			return (
				env.store.get(key) ??
				(env.outer
					? yield* get(env.outer)(key)
					: builtins[yield* Schema.decodeUnknown(builtinsKeySchema)(key)])
			);
		});

export const set = (env: Environment) => (key: string, value: Obj) => {
	env.store.set(key, value);
	return value;
};

// export type Environment = {
// 	store: Map<string, Obj>;
// 	outer: Environment | undefined;
// };

// export const createEnvironment = (
// 	outer?: Environment | undefined,
// ): Environment => ({
// 	store: new Map<string, Obj>(),
// 	outer,
// });

export interface Environment {
	readonly outer: Environment | undefined;
	readonly store: Map<string, Obj>;
}

export interface EnvironmentEncoded {
	readonly outer: EnvironmentEncoded | undefined;
	readonly store: readonly (readonly [string, Obj])[];
}

export const Environment = Schema.Struct({
	store: Schema.Map({ key: Schema.String, value: Obj }),
	outer: Schema.Union(
		Schema.suspend(
			(): Schema.Schema<Environment, EnvironmentEncoded> => Environment,
		),
		Schema.Undefined,
	),
});

// export const createEnvironment = (outer?: Environment | undefined) =>
// 	Environment.make({
// 		store: new Map<string, Obj>(),
// 		outer,
// 	});

export const printStore = (env: Environment): string => {
	let output = "Environment Store:\n";
	env.store.forEach((value, key) => {
		output += `${key}: ${objInspect(value)}\n`;
	});

	if (env.outer) {
		output += "\nOuter Environment:\n";
		output += printStore(env.outer);
	}

	return output;
};

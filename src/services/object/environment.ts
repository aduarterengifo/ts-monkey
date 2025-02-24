import { IdentExp } from "@/schemas/nodes/exps/ident";
import { Obj, type ObjEncoded } from "@/schemas/objs/union";
import { Effect, Schema } from "effect";
import type { ParseError } from "effect/ParseResult";
import { objInspect } from ".";
import { builtins, builtinsKeySchema } from "./builtins";

export const get =
	(env: Environment) =>
	(key: string): Effect.Effect<Obj, ParseError, never> =>
		Effect.gen(function* () {
			return (
				env.store[key] ??
				(env.outer
					? yield* get(env.outer)(key)
					: builtins[yield* Schema.decodeUnknown(builtinsKeySchema)(key)])
			);
		});

export const set = (env: Environment) => (key: string, value: Obj) => {
	env.store[key] = value;
	return value;
};

export interface Environment {
	readonly outer: Environment | undefined;
	readonly store: Record<string, Obj>;
	readonly idents: readonly IdentExp[];
}

export interface EnvironmentEncoded {
	readonly outer: EnvironmentEncoded | undefined;
	readonly store: Record<string, ObjEncoded>;
	readonly idents: readonly IdentExp[];
}

export const Environment = Schema.Struct({
	store: Schema.Record({ key: Schema.String, value: Obj }),
	idents: Schema.Array(IdentExp),
	outer: Schema.Union(
		Schema.suspend(
			(): Schema.Schema<Environment, EnvironmentEncoded> => Environment,
		),
		Schema.Undefined,
	),
});

export const createEnvironment = (outer?: Environment | undefined) =>
	Environment.make({
		store: {},
		outer,
		idents: [],
	});

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

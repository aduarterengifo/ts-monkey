import { Effect, Schema } from "effect";
import { KennethParseError } from "../../../errors/kenneth/parse";
import { identTokenSchema } from "../../../schemas/token/ident";
export type IdentExpEncoded = Schema.Schema.Encoded<typeof IdentExp>;

export const IdentExp = Schema.TaggedStruct("IdentExp", {
	token: identTokenSchema,
	value: Schema.String,
});

export type IdentExp = typeof IdentExp.Type;

export const IdentExpEq = Schema.equivalence(IdentExp);

export const expectIdentEquivalence = (a: IdentExp, b: IdentExp) =>
	Effect.gen(function* () {
		return !IdentExpEq(a, b)
			? yield* new KennethParseError({
					message: "we expected ident to equal x",
				})
			: undefined;
	});

export const nativeToIdentExp = (value: string) =>
	IdentExp.make({
		token: {
			_tag: "IDENT",
			literal: value,
		},
		value,
	});

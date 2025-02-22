import { Effect, Schema } from "effect";
import { KennethParseError } from "../../../errors/kenneth/parse";
import { identTokenSchema } from "../../../schemas/token/ident";
import type { INode } from "../interfaces/internal-node";

export type IdentExpEncoded = Schema.Schema.Encoded<typeof IdentExp>;

export class IdentExp
	extends Schema.TaggedClass<IdentExp>()("IdentExp", {
		token: identTokenSchema,
		value: Schema.String,
	})
	implements INode
{
	string() {
		return this.value;
	}
}

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
	new IdentExp({
		token: {
			_tag: "IDENT",
			literal: value,
		},
		value,
	});

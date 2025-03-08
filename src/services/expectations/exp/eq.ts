import { KennethEvalError } from "@/errors/kenneth/eval";
import { BoolExp } from "@/schemas/nodes/exps/boolean";
import { IdentExp } from "@/schemas/nodes/exps/ident";
import { IntExp } from "@/schemas/nodes/exps/int";
import { StrExp } from "@/schemas/nodes/exps/str";
import type { Exp } from "@/schemas/nodes/exps/union";
import { Effect, Schema, pipe } from "effect";

export const expectIdentExpEq = (exp: Exp, expected: string) =>
	pipe(
		exp,
		Schema.decodeUnknown(IdentExp),
		Effect.filterOrFail(
			(exp) => exp.value === expected,
			(exp) =>
				new KennethEvalError({
					message: `Expected '${expected}' but got '${exp.value}'`,
				}),
		),
	);

export const expectStrExpEq = (exp: Exp, expected: string) =>
	pipe(
		exp,
		Schema.decodeUnknown(StrExp),
		Effect.filterOrFail(
			(exp) => exp.value === expected,
			(exp) =>
				new KennethEvalError({
					message: `Expected '${expected}' but got '${exp.value}'`,
				}),
		),
	);

export const expectIntExpEq = (exp: Exp, expected: number) =>
	pipe(
		exp,
		Schema.decodeUnknown(IntExp),
		Effect.filterOrFail(
			(exp) => exp.value === expected,
			(exp) =>
				new KennethEvalError({
					message: `Expected '${expected}' but got '${exp.value}'`,
				}),
		),
	);

export const expectBooleanExpEq = (exp: Exp, expected: boolean) =>
	pipe(
		exp,
		Schema.decodeUnknown(BoolExp),
		Effect.filterOrFail(
			(exp) => exp.value === expected,
			(exp) =>
				new KennethEvalError({
					message: `Expected '${expected}' but got '${exp.value}'`,
				}),
		),
	);

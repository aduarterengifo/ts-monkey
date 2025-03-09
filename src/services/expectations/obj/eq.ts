import { KennethEvalError } from "@/errors/kenneth/eval";
import { BooleanObj } from "@/schemas/objs/bool";
import { IntegerObj } from "@/schemas/objs/int";
import { StringObj } from "@/schemas/objs/string";
import type { Obj } from "@/schemas/objs/union";
import { Effect, Schema, pipe } from "effect";

export const expectStrObjEq = (obj: Obj, expected: string) =>
	pipe(
		obj,
		Schema.decodeUnknown(StringObj),
		Effect.filterOrFail(
			({ value }) => value === expected,
			({ value }) =>
				new KennethEvalError({
					message: `Expected '${expected}' but got '${value}'`,
				}),
		),
	);

export const expectIntObjEq = (obj: Obj, expected: number) =>
	pipe(
		obj,
		Schema.decodeUnknown(IntegerObj),
		Effect.filterOrFail(
			({ value }) => value === expected,
			({ value }) =>
				new KennethEvalError({
					message: `Expected '${expected}' but got '${value}'`,
				}),
		),
	);

export const expectBooleanObjEq = (obj: Obj, expected: boolean) =>
	pipe(
		obj,
		Schema.decodeUnknown(BooleanObj),
		Effect.filterOrFail(
			({ value }) => value === expected,
			({ value }) =>
				new KennethEvalError({
					message: `Expected '${expected}' but got '${value}'`,
				}),
		),
	);

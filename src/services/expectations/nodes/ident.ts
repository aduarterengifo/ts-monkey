import { KennethEvalError } from "@/errors/kenneth/eval";
import { BoolExp } from "@/schemas/nodes/exps/boolean";
import { IdentExp } from "@/schemas/nodes/exps/ident";
import { IntExp } from "@/schemas/nodes/exps/int";
import { StrExp } from "@/schemas/nodes/exps/str";
import { Exp } from "@/schemas/nodes/exps/union";
import { Effect, pipe, Schema } from "effect";

const expectExp = <T extends { value: any }>(
  exp: Exp,
  schema: Schema.Schema<T>,
  expected: T['value']
) =>
  pipe(
    exp,
    Schema.decodeUnknown(schema),
    Effect.filterOrFail(
      (exp) => exp.value === expected,
      (exp) => new KennethEvalError({ message: `Expected '${expected}' but got '${exp.value}'` })
    )
  );

export const expectIdentExp = (exp: Exp, expected: string) =>
    expectExp(exp, IdentExp, expected);
//   pipe(
//     exp,
//     Schema.decodeUnknown(IdentExp),
//     Effect.filterOrFail(
//         (exp) => exp.value === expected,
//         (exp) => new KennethEvalError({message:`Expected '${exp}' but got '${exp}'`})
//     )
//   );

export const expectStrExp = (exp: Exp, expected: string) =>
  pipe(
    exp,
    Schema.decodeUnknown(StrExp),
    Effect.filterOrFail(
        (exp) => exp.value === expected,
        (exp) => new KennethEvalError({message:`Expected '${expected}' but got '${exp.value}'`})
    )
  );

export const expectIntExp = (exp: Exp, expected: number) =>
  pipe(
    exp,
    Schema.decodeUnknown(IntExp),
    Effect.filterOrFail(
        (exp) => exp.value === expected,
        (exp) => new KennethEvalError({message:`Expected '${expected}' but got '${exp.value}'`})
    )
  );

export const expectBooleanExp = (exp: Exp, expected: boolean) =>
  pipe(
    exp,
    Schema.decodeUnknown(BoolExp),
    Effect.filterOrFail(
        (exp) => exp.value === expected,
        (exp) => new KennethEvalError({message:`Expected '${expected}' but got '${exp.value}'`})
    )
  );

import { Schema } from "effect";

export const BuiltInDiffFunc = Schema.Literal("sin", "cos", "tan");

export type DiffFunction = typeof BuiltInDiffFunc.Type;

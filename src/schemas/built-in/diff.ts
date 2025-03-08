import { Schema } from "effect";

// would be nice to express this as a subset of builtin functions
// to at the type level avoid adding something here that isn't in builtin
export const BuiltInDiffFunc = Schema.Literal("sin", "cos", "tan", "ln", "exp");

export type DiffFunction = typeof BuiltInDiffFunc.Type;

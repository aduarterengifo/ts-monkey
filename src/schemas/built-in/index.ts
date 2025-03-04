import { Schema } from "effect";

export const BuiltInFunc = Schema.Literal(
	"len",
	"diff",
	"sin",
	"cos",
	"tan",
	"ln",
	"exp",
	"pi",
	"e",
);

export type BuiltInFunc = typeof BuiltInFunc.Type;

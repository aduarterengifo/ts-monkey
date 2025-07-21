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
	"first",
);

export type BuiltInFunc = typeof BuiltInFunc.Type;

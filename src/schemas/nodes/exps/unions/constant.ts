import { Schema } from "effect";
import { BoolExp } from "../boolean";
import { IntExp } from "../int";
import { StrExp } from "../str";

export type ConstantExp = IntExp | StrExp | BoolExp;

export const constantExpSchema = Schema.suspend(
	(): Schema.Schema<ConstantExp> => Schema.Union(IntExp, StrExp, BoolExp),
);

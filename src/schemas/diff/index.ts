// primitive schema
// int
// x
// x ** int
// int * x ** int
// sin(x)
// cos(x)
// tan(x)
// ln(x)
// exp(x)

import { Schema } from "effect";
import { InfixExp } from "../nodes/exps/infix";
import { IdentObj } from "../objs/ident";
import { IntegerObj } from "../objs/int";

// I want to answer the question:
// is this a primitive form?

// basically given obj and x.
// ask the questions:
// is obj the obj version of x
// is obj an infixObj with left x and right int
// is obj an infixobj with left int and right infix
// is obj a callobj with sin, cos, tan, ln, exp?

const PrimitiveDiff = Schema.Union(
	IntegerObj,
	IdentObj,
	InfixExp, //
);

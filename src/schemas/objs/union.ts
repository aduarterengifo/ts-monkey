import { Schema } from "effect";
import { BooleanObj } from "./bool";
import { BuiltInObj } from "./built-in";
import { ErrorObj } from "./error";
import { FunctionObj } from "./function";
import { IdentObj } from "./ident";
import { InfixObj } from "./infix";
import { IntegerObj } from "./int";
import { NullObj } from "./null";
import { ReturnObj } from "./return";
import { StringObj } from "./string";

export type Obj =
	| BooleanObj
	| BuiltInObj
	| ErrorObj
	| FunctionObj
	| IntegerObj
	| NullObj
	| ReturnObj
	| StringObj
	| IdentObj
	| InfixObj;

export const Obj = Schema.suspend(
	(): Schema.Schema<Obj> =>
		Schema.Union(
			BooleanObj,
			BuiltInObj,
			ErrorObj,
			FunctionObj,
			IntegerObj,
			NullObj,
			ReturnObj,
			StringObj,
			IdentObj,
			InfixObj,
		),
);

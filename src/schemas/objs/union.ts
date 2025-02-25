import { Schema } from "effect";
import { ArrayObj, type ArrayObjEncoded } from "./array";
import { BooleanObj } from "./bool";
import { BuiltInObj } from "./built-in";
import { ErrorObj } from "./error";
import { FunctionObj, type FunctionObjEncoded } from "./function";
import { IdentObj } from "./ident";
import { InfixObj, type InfixObjEncoded } from "./infix";
import { IntegerObj } from "./int";
import { NullObj } from "./null";
import { ReturnObj, type ReturnObjEncoded } from "./return";
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
	| InfixObj
	| ArrayObj;

export type ObjEncoded =
	| Exclude<Obj, FunctionObj | ReturnObj | InfixObj | ArrayObj>
	| FunctionObjEncoded
	| ReturnObjEncoded
	| InfixObjEncoded
	| ArrayObjEncoded;

export const Obj = Schema.suspend(
	(): Schema.Schema<Obj, ObjEncoded> =>
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
			ArrayObj,
		),
);

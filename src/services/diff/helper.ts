import type { IdentExp } from "@/schemas/nodes/exps/ident";
import type { Exp } from "@/schemas/nodes/exps/union";
import { BlockStmt } from "@/schemas/nodes/stmts/block";
import { ExpStmt } from "@/schemas/nodes/stmts/exp";
import { CallObj } from "@/schemas/objs/call";
import { FunctionObj } from "@/schemas/objs/function";
import type { PolynomialObj } from "@/schemas/objs/unions/polynomials";
import { Effect } from "effect";
import { createEnvironment } from "../object/environment";

export const makeLambda = (
	x: IdentExp,
	args: readonly Exp[],
	expression: Exp,
): Effect.Effect<PolynomialObj, never, never> =>
	Effect.succeed(
		CallObj.make({
			fn: FunctionObj.make({
				env: createEnvironment(),
				params: [x],
				body: BlockStmt.make({
					token: { _tag: "!", literal: "!" },
					statements: [
						ExpStmt.make({
							token: {
								_tag: "!",
								literal: "!",
							},
							expression,
						}),
					],
				}),
			}),
			args,
		}),
	);

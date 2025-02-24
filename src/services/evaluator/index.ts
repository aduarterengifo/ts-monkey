import { FALSE, TRUE, nativeBoolToObjectBool } from "@/schemas/objs/bool";
import { BuiltInObj } from "@/schemas/objs/built-in";
import { FunctionObj } from "@/schemas/objs/function";
import { IdentObj } from "@/schemas/objs/ident";
import { InfixObj } from "@/schemas/objs/infix";
import { IntegerObj } from "@/schemas/objs/int";
import { NULL } from "@/schemas/objs/null";
import { ReturnObj } from "@/schemas/objs/return";
import { StringObj } from "@/schemas/objs/string";
import type { Obj } from "@/schemas/objs/union";
import { PolynomialObj } from "@/schemas/objs/unions/polynomials";
import { Effect, Match, Schema } from "effect";
import type { ParseError } from "effect/ParseResult";
import type { KennethParseError } from "src/errors/kenneth/parse";
import type { DiffExp } from "src/schemas/nodes/exps/diff";
import { type IdentExp, IdentExpEq } from "src/schemas/nodes/exps/ident";
import type { IfExp } from "src/schemas/nodes/exps/if";
import { OpInfixExp } from "src/schemas/nodes/exps/infix";
import { nativeToIntExp } from "src/schemas/nodes/exps/int";
import type { Exp } from "src/schemas/nodes/exps/union";
import type { Program } from "src/schemas/nodes/program";
import type { BlockStmt } from "src/schemas/nodes/stmts/block";
import type { Stmt } from "src/schemas/nodes/stmts/union";
import { type KNode, matchKnode } from "src/schemas/nodes/union";
import type { PrefixOperator } from "src/schemas/prefix-operator";
import { TokenType } from "src/schemas/token-types/union";
import type { Token } from "src/schemas/token/unions/all";
import { KennethEvalError } from "../../errors/kenneth/eval";
import type { InfixOperator } from "../../schemas/infix-operator";
import { diffPolynomial } from "../diff/obj";
import {
	isIdentObj,
	isInfixObj,
	isIntegerObj,
	isReturnObj,
	isStringObj,
} from "../object";
import { builtInFnMap } from "../object/builtins";
import {
	Environment,
	createEnvironment,
	get,
	set,
} from "../object/environment";
import { Parser } from "../parser";
import {
	OPERATOR_TO_FUNCTION_MAP,
	STRING_OPERATOR_TO_FUNCTION_MAP,
} from "./constants";

const nodeEvalMatch = (env: Environment) =>
	matchKnode({
		Program: ({ statements }) =>
			evalProgram(statements, env).pipe(Effect.map(unwrapReturnvalue)),
		IdentExp: (ident) =>
			env.idents.some((id) => IdentExpEq(id, ident))
				? Effect.succeed(IdentObj.make({ identExp: ident }))
				: evalIdentExpression(ident, env),
		LetStmt: ({ value, name }) =>
			Effect.gen(function* () {
				const val = yield* Eval(value)(env);
				set(env)(name.value, val);
				return NULL;
			}),
		ReturnStmt: ({ value }) =>
			Eval(value)(env).pipe(
				Effect.map((obj) => ReturnObj.make({ value: obj })),
			),
		ExpStmt: ({ expression }) => Eval(expression)(env),
		IntExp: ({ value }) => Effect.succeed(IntegerObj.make({ value })),
		PrefixExp: ({ operator, right }) =>
			Eval(right)(env).pipe(
				Effect.flatMap((r) => evalPrefixExpression(operator)(r)),
			),
		InfixExp: ({ left, operator, right }) =>
			Effect.all([Eval(left)(env), Eval(right)(env)]).pipe(
				Effect.flatMap(([leftVal, rightVal]) =>
					evalInfixExpression(operator)(leftVal)(rightVal),
				),
			),
		BoolExp: ({ value }) => Effect.succeed(nativeBoolToObjectBool(value)),
		IfExp: (ie) => evalIfExpression(ie, env),
		BlockStmt: (stmt) => evalBlockStatement(stmt, env),
		FuncExp: ({ parameters, body }) =>
			Effect.succeed(FunctionObj.make({ params: parameters, body, env })),
		CallExp: ({ fn, args }) =>
			Effect.all([Eval(fn)(env), evalExpressions(args, env)]).pipe(
				Effect.flatMap(([fnEval, argsEval]) =>
					Schema.decodeUnknown(Schema.Union(FunctionObj, BuiltInObj))(
						fnEval,
					).pipe(Effect.flatMap((obj) => applyFunction(obj)(argsEval))),
				),
			),
		StrExp: ({ value }) => Effect.succeed(StringObj.make({ value })),
		DiffExp: (diffExp) => evalDiff(diffExp)(env),
	});

export const Eval =
	(node: KNode) =>
	(
		env: Environment,
	): Effect.Effect<
		Obj,
		KennethEvalError | ParseError | KennethParseError,
		never
	> =>
		nodeEvalMatch(env)(node).pipe(Effect.withSpan("eval.Eval"));

export const evalDiff = (diffExp: DiffExp) => (env: Environment) =>
	Effect.gen(function* () {
		// yield* logDebug('evalDiff')
		// this is during running this function. the diff function to be sure! so it will return a number
		// NEED to do a soft eval of all the expressions here.
		const newEnv = Environment.make({
			store: env.store,
			outer: env.outer,
			idents: [...env.idents, ...diffExp.params],
		});
		const softEval = yield* Eval(diffExp.exp)(newEnv).pipe(
			Effect.flatMap(Schema.decodeUnknown(PolynomialObj)),
		);

		const diffSoftEval = yield* diffPolynomial(softEval, diffExp.params[0]);

		// maybe simplest will be to convert back to exp and Eval.
		const convertToExp = (obj: PolynomialObj): Effect.Effect<Exp, ParseError> =>
			Match.value(obj).pipe(
				Match.tag("IntegerObj", ({ value }) =>
					Effect.succeed(nativeToIntExp(value)),
				),
				Match.tag("IdentObj", ({ identExp }) => Effect.succeed(identExp)),
				Match.tag("InfixObj", ({ left, operator, right }) =>
					Effect.all([
						Schema.decodeUnknown(PolynomialObj)(left).pipe(
							Effect.flatMap(convertToExp),
						),
						Schema.decodeUnknown(PolynomialObj)(right).pipe(
							Effect.flatMap(convertToExp),
						),
					]).pipe(
						Effect.flatMap(([leftVal, rightVal]) =>
							Effect.succeed(OpInfixExp(operator)(leftVal)(rightVal)),
						),
					),
				),
				Match.exhaustive,
			);

		const expResult = yield* convertToExp(diffSoftEval);

		// yield* logDebug('exp', expResult)
		// yield* logDebug('--------------------------')

		return yield* Eval(expResult)(env);
	});

export const applyFunction = (fn: FunctionObj | BuiltInObj) => (args: Obj[]) =>
	Match.value(fn).pipe(
		Match.tag("BuiltInObj", (fn) => builtInFnMap[fn.fn](...args)),
		Match.tag("FunctionObj", (fn) =>
			extendFunctionEnv(fn, args).pipe(
				Effect.flatMap((env) => Eval(fn.body)(env)),
				Effect.map(unwrapReturnvalue),
			),
		),
		Match.exhaustive,
		Effect.withSpan("eval.applyFunction"),
	);

export const extendFunctionEnv = (fn: FunctionObj, args: Obj[]) =>
	Effect.gen(function* () {
		const env = createEnvironment(fn.env);
		for (let i = 0; i < fn.params.length; i++) {
			set(env)(fn.params[i].value, args[i]);
		}
		return yield* Effect.succeed(env);
	}).pipe(Effect.withSpan("eval.extendFunctionEnv"));

export const unwrapReturnvalue = (obj: Obj) =>
	isReturnObj(obj) ? obj.value : obj;

export const evalExpressions = (exps: readonly Exp[], env: Environment) =>
	Effect.all(exps.map((exp) => Eval(exp)(env))).pipe(
		Effect.withSpan("eval.evalExpressions"),
	);

export const evalIdentExpression = (ident: IdentExp, env: Environment) =>
	get(env)(ident.value).pipe(Effect.withSpan("eval.evalIdentExpression"));

export const evalIfExpression = (ie: IfExp, env: Environment) =>
	Effect.gen(function* () {
		const condition = yield* Eval(ie.condition)(env).pipe(Effect.map(isTruthy));
		return condition
			? yield* Eval(ie.consequence)(env)
			: ie.alternative
				? yield* Eval(ie.alternative)(env)
				: NULL;
	}).pipe(Effect.withSpan("eval.evalIfExpression"));

export const isTruthy = (obj: Obj) =>
	Match.value(obj).pipe(
		Match.tag("NullObj", () => false),
		Match.tag("BooleanObj", (obj) => obj.value),
		Match.orElse(() => true),
	);

const evalStatements = (stmts: readonly Stmt[], env: Environment) =>
	Effect.gen(function* () {
		let result: Obj = NULL;
		for (const stmt of stmts) {
			result = yield* Eval(stmt)(env);
			if (isReturnObj(result)) {
				return result;
			}
		}
		return result;
	});

export const evalProgram = (stmts: readonly Stmt[], env: Environment) =>
	evalStatements(stmts, env).pipe(Effect.withSpan("eval.evalProgram"));

export const evalBlockStatement = (block: BlockStmt, env: Environment) =>
	evalStatements(block.statements, env).pipe(
		Effect.withSpan("eval.evalBlockStatement"),
	);

export const evalInfixExpression =
	(operator: InfixOperator) => (left: Obj) => (right: Obj) =>
		Effect.gen(function* () {
			if (
				isIdentObj(left) ||
				isIdentObj(right) ||
				isInfixObj(left) ||
				isInfixObj(right)
			) {
				return InfixObj.make({ left, operator, right }); // soft eval condition
			}
			if (isIntegerObj(left) && isIntegerObj(right)) {
				return evalIntegerInfixExpression(operator, left, right);
			}
			if (isStringObj(left) && isStringObj(right)) {
				const plus = yield* Schema.decodeUnknown(
					Schema.Literal(TokenType.PLUS),
				)(operator);
				return evalStringInfixExpression(plus, left, right);
			}
			if (operator === TokenType.EQ) {
				return nativeBoolToObjectBool(left === right); // we do object equality I guess?
			}
			if (operator === TokenType.NOT_EQ) {
				return nativeBoolToObjectBool(left !== right);
			}
			return yield* new KennethEvalError({
				message:
					left._tag !== right._tag
						? `type mismatch: ${left._tag} ${operator} ${right._tag}`
						: `unknown operator: ${left._tag} ${operator} ${right._tag}`,
			});
		}).pipe(Effect.withSpan("eval.evalInfixExpression"));

const nativeToObj = (result: number | boolean | string) =>
	Match.value(result).pipe(
		Match.when(Match.boolean, (bool) => nativeBoolToObjectBool(bool)),
		Match.when(Match.number, (num) => IntegerObj.make({ value: num })),
		Match.when(Match.string, (str) => StringObj.make({ value: str })),
		Match.exhaustive,
	);

export const evalIntegerInfixExpression = (
	operator: InfixOperator,
	left: IntegerObj,
	right: IntegerObj,
) => nativeToObj(OPERATOR_TO_FUNCTION_MAP[operator](left.value, right.value));

export const evalStringInfixExpression = (
	operator: typeof TokenType.PLUS,
	left: StringObj,
	right: StringObj,
) =>
	nativeToObj(
		STRING_OPERATOR_TO_FUNCTION_MAP[operator](left.value, right.value),
	);

export const evalPrefixExpression =
	(operator: PrefixOperator) => (right: Obj) =>
		Match.value(operator).pipe(
			Match.when(TokenType.BANG, () => evalBangOperatorExpression(right)),
			Match.when(TokenType.MINUS, () =>
				Schema.decodeUnknown(IntegerObj)(right).pipe(
					Effect.flatMap(evalMinusPrefixOperatorExpression),
				),
			),
			Match.exhaustive,
		);

export const evalMinusPrefixOperatorExpression = (right: IntegerObj) =>
	Effect.succeed(IntegerObj.make({ value: -right.value }));

export const evalBangOperatorExpression = (right: Obj) =>
	Effect.succeed(
		Match.value(right).pipe(
			Match.tag("BooleanObj", (obj) => (obj.value ? FALSE : TRUE)),
			Match.tag("NullObj", () => TRUE),
			Match.orElse(() => FALSE),
		),
	).pipe(Effect.withSpan("eval.evalBangOperatorExpression"));

export type ProgramInterpretation = {
	program: Program;
	evaluation: Obj;
	lexerStory: {
		input: string;
		tokens: Token[];
		pos1History: number[][];
		pos2History: number[][];
	};
};

export class Evaluator extends Effect.Service<Evaluator>()("Evaluator", {
	effect: Effect.gen(function* () {
		const parser = yield* Parser;
		const run = (input: string) =>
			Effect.gen(function* () {
				yield* parser.init(input);
				const program = yield* parser.parseProgramOptimized;
				const env = createEnvironment();
				return yield* nodeEvalMatch(env)(program);
			}).pipe(Effect.withSpan("eval.run"));

		const runAndInterpret = (
			input: string,
		): Effect.Effect<
			ProgramInterpretation,
			ParseError | KennethEvalError | KennethParseError,
			never
		> =>
			Effect.gen(function* () {
				yield* parser.init(input);
				const program = yield* parser.parseProgram;
				const lexerStory = yield* parser.getLexerStory;
				const parserStory = yield* parser.getParserStory;
				const env = createEnvironment();
				const evaluation = yield* nodeEvalMatch(env)(program);
				return {
					program,
					evaluation,
					lexerStory,
					parserStory,
				};
			});

		return {
			run,
			runAndInterpret,
		};
	}),
	dependencies: [Parser.Default],
}) {}

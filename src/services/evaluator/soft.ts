import {
	createIntegerObj,
	FALSE,
	type IntegerObj,
	isIntegerObj,
	nativeBoolToObjectBool,
	NULL,
	TRUE,
	type Obj,
	createReturnObj,
	isReturnObj,
	createFunctionObj,
	type FunctionObj,
	isFunctionObj,
	createStringObj,
	type BuiltInObj,
	isBuiltInObj,
	isStringObj,
	type StringObj,
} from '../object'
import { Effect, Match, Schema } from 'effect'
import { Parser } from '../parser'
import { createEnvironment, type Environment } from '../object/environment'
import type { InfixOperator } from '../../schemas/infix-operator'
import type { ParseError } from 'effect/ParseResult'
import { KennethEvalError } from '../../errors/kenneth/eval'
import type { PrefixOperator } from 'src/schemas/prefix-operator'
import type { KennethParseError } from 'src/errors/kenneth/parse'
import { TokenType } from 'src/schemas/token-types/union'
import { type KNode, matchKnode } from 'src/schemas/nodes/union'
import type { IdentExp } from 'src/schemas/nodes/exps/ident'
import type { IfExp } from 'src/schemas/nodes/exps/if'
import type { BlockStmt } from 'src/schemas/nodes/stmts/block'
import type { Program } from 'src/schemas/nodes/program'
import type { Token } from 'src/schemas/token/unions/all'
import type { Exp } from 'src/schemas/nodes/exps/union'
import type { Stmt } from 'src/schemas/nodes/stmts/union'
import {
	OPERATOR_TO_FUNCTION_MAP,
	STRING_OPERATOR_TO_FUNCTION_MAP,
} from './constants'
import type { DiffExp } from 'src/schemas/nodes/exps/diff'

const nodeEvalMatch = (env: Environment, identExp?: IdentExp | undefined) =>
	matchKnode({
		Program: ({ statements }) =>
			evalProgram(statements, env).pipe(Effect.map(unwrapReturnvalue)),
		IdentExp: (ident) => evalIdentExpression(ident, env),
		LetStmt: ({ value, name }) =>
			Effect.gen(function* () {
				const val = yield* Eval(value)(env)
				env.set(name.value, val)
				return NULL
			}),
		ReturnStmt: ({ value }) =>
			Eval(value)(env).pipe(Effect.map(createReturnObj)),
		ExpStmt: ({ expression }) => Eval(expression)(env),
		IntExp: ({ value }) => Effect.succeed(createIntegerObj(+value)),
		PrefixExp: ({ operator, right }) =>
			Effect.gen(function* () {
				const r = yield* Eval(right)(env)
				return yield* evalPrefixExpression(operator)(r)
			}),
		InfixExp: ({ left, operator, right }) =>
			Effect.gen(function* () {
				const leftEval = yield* Eval(left)(env)
				const rightEval = yield* Eval(right)(env)
				return yield* evalInfixExpression(operator)(leftEval)(rightEval)
			}),
		BoolExp: ({ value }) => Effect.succeed(nativeBoolToObjectBool(value)),
		IfExp: (ie) => evalIfExpression(ie, env),
		BlockStmt: (stmt) => evalBlockStatement(stmt, env),
		FuncExp: ({ parameters, body }) =>
			Effect.succeed(createFunctionObj(parameters, body, env)),
		CallExp: ({ fn, args }) =>
			Effect.gen(function* () {
				const fnEval = yield* Eval(fn)(env)
				const argsEval = yield* evalExpressions(args, env)

				return yield* isFunctionObj(fnEval) || isBuiltInObj(fnEval)
					? applyFunction(fnEval)(argsEval)
					: new KennethEvalError({ message: `not a function: ${fnEval._tag}` })
			}),
		StrExp: ({ value }) => Effect.succeed(createStringObj(value)),
		DiffExp: (diffExp) => evalDiff(diffExp)(env),
	})

export const Eval =
	(node: KNode) =>
	(
		env: Environment,
		identExp?: IdentExp | undefined,
	): Effect.Effect<
		Obj,
		KennethEvalError | ParseError | KennethParseError,
		never
	> =>
		nodeEvalMatch(env, ident)(node).pipe(Effect.withSpan('eval.Eval'))

export const evalDiff = (diffExp: DiffExp) => (env: Environment) =>
	Effect.gen(function* () {
		// this is during running this function. the diff function to be sure! so it will return a number
		// NEED to do a soft eval of all the expressions here.
		// need a way to indicate the **special** variable.
		const softEval = yield* Eval(diffExp.exp)(env, diffExp.params[0])
	})

export const applyFunction = (fn: FunctionObj | BuiltInObj) => (args: Obj[]) =>
	Match.value(fn).pipe(
		Match.tag('BuiltInObj', (fn) => fn.fn(...args)),
		Match.tag('FunctionObj', (fn) =>
			extendFunctionEnv(fn, args).pipe(
				Effect.flatMap((env) => Eval(fn.body)(env)),
				Effect.map(unwrapReturnvalue),
			),
		),
		Match.exhaustive,
		Effect.withSpan('eval.applyFunction'),
	)

export const extendFunctionEnv = (fn: FunctionObj, args: Obj[]) =>
	Effect.gen(function* () {
		const env = createEnvironment(fn.env)
		for (let i = 0; i < fn.params.length; i++) {
			env.set(fn.params[i].value, args[i])
		}
		return yield* Effect.succeed(env)
	}).pipe(Effect.withSpan('eval.extendFunctionEnv'))

export const unwrapReturnvalue = (obj: Obj) =>
	isReturnObj(obj) ? obj.value : obj

export const evalExpressions = (exps: readonly Exp[], env: Environment) =>
	Effect.all(exps.map((exp) => Eval(exp)(env))).pipe(
		Effect.withSpan('eval.evalExpressions'),
	)

export const evalIdentExpression = (ident: IdentExp, env: Environment) =>
	env.get(ident.value).pipe(Effect.withSpan('eval.evalIdentExpression'))

export const evalIfExpression = (ie: IfExp, env: Environment) =>
	Effect.gen(function* () {
		const condition = yield* Eval(ie.condition)(env).pipe(Effect.map(isTruthy))
		return condition
			? yield* Eval(ie.consequence)(env)
			: ie.alternative
				? yield* Eval(ie.alternative)(env)
				: NULL
	}).pipe(Effect.withSpan('eval.evalIfExpression'))

export const isTruthy = (obj: Obj) =>
	Match.value(obj).pipe(
		Match.tag('NullObj', () => false),
		Match.tag('BooleanObj', (obj) => obj.value),
		Match.orElse(() => true),
	)

const evalStatements = (stmts: readonly Stmt[], env: Environment) =>
	Effect.gen(function* () {
		let result: Obj = NULL
		for (const stmt of stmts) {
			result = yield* Eval(stmt)(env)
			if (isReturnObj(result)) {
				return result
			}
		}
		return result
	})

export const evalProgram = (stmts: readonly Stmt[], env: Environment) =>
	evalStatements(stmts, env).pipe(Effect.withSpan('eval.evalProgram'))

export const evalBlockStatement = (block: BlockStmt, env: Environment) =>
	evalStatements(block.statements, env).pipe(
		Effect.withSpan('eval.evalBlockStatement'),
	)

export const evalInfixExpression =
	(operator: InfixOperator) => (left: Obj) => (right: Obj) =>
		Effect.gen(function* () {
			if (isIntegerObj(left) && isIntegerObj(right)) {
				return evalIntegerInfixExpression(operator, left, right)
			}
			if (isStringObj(left) && isStringObj(right)) {
				const plus = yield* Schema.decodeUnknown(
					Schema.Literal(TokenType.PLUS),
				)(operator)
				return evalStringInfixExpression(plus, left, right)
			}
			if (operator === TokenType.EQ) {
				return nativeBoolToObjectBool(left === right) // we do object equality I guess?
			}
			if (operator === TokenType.NOT_EQ) {
				return nativeBoolToObjectBool(left !== right)
			}
			return yield* new KennethEvalError({
				message:
					left._tag !== right._tag
						? `type mismatch: ${left._tag} ${operator} ${right._tag}`
						: `unknown operator: ${left._tag} ${operator} ${right._tag}`,
			})
		}).pipe(Effect.withSpan('eval.evalInfixExpression'))

const nativeToObj = (result: number | boolean | string) =>
	Match.value(result).pipe(
		Match.when(Match.boolean, (bool) => nativeBoolToObjectBool(bool)),
		Match.when(Match.number, (num) => createIntegerObj(num)),
		Match.when(Match.string, (str) => createStringObj(str)),
		Match.exhaustive,
	)

export const evalIntegerInfixExpression = (
	operator: InfixOperator,
	left: IntegerObj,
	right: IntegerObj,
) => nativeToObj(OPERATOR_TO_FUNCTION_MAP[operator](left.value, right.value))

export const evalStringInfixExpression = (
	operator: typeof TokenType.PLUS,
	left: StringObj,
	right: StringObj,
) =>
	nativeToObj(
		STRING_OPERATOR_TO_FUNCTION_MAP[operator](left.value, right.value),
	)

export const evalPrefixExpression =
	(operator: PrefixOperator) => (right: Obj) =>
		Match.value(operator).pipe(
			Match.when(TokenType.BANG, () => evalBangOperatorExpression(right)),
			Match.when(TokenType.MINUS, () =>
				Match.value(right).pipe(
					Match.tag('IntegerObj', (intObj) =>
						evalMinusPrefixOperatorExpression(intObj),
					),
					Match.orElse(
						() =>
							new KennethEvalError({
								message: `unknown operator: -${right._tag}`,
							}),
					),
				),
			),
			Match.exhaustive,
		)

export const evalMinusPrefixOperatorExpression = (right: IntegerObj) =>
	Effect.succeed(createIntegerObj(-right.value))

export const evalBangOperatorExpression = (right: Obj) =>
	Effect.succeed(
		Match.value(right).pipe(
			Match.tag('BooleanObj', (obj) => (obj.value ? FALSE : TRUE)),
			Match.tag('NullObj', () => TRUE),
			Match.orElse(() => FALSE),
		),
	).pipe(Effect.withSpan('eval.evalBangOperatorExpression'))

export type ProgramInterpretation = {
	program: Program
	evaluation: Obj
	lexerStory: {
		input: string
		tokens: Token[]
		pos1History: number[][]
		pos2History: number[][]
	}
}

export class SoftEvaluator extends Effect.Service<SoftEvaluator>()(
	'SoftEvaluator',
	{
		effect: Effect.gen(function* () {
			const parser = yield* Parser
			const run = (input: string) =>
				Effect.gen(function* () {
					yield* parser.init(input)
					const program = yield* parser.parseProgramOptimized
					const env = createEnvironment()
					return yield* nodeEvalMatch(env)(program)
				}).pipe(Effect.withSpan('eval.run'))

			const runAndInterpret = (
				input: string,
			): Effect.Effect<
				ProgramInterpretation,
				ParseError | KennethEvalError | KennethParseError,
				never
			> =>
				Effect.gen(function* () {
					yield* parser.init(input)
					const program = yield* parser.parseProgram
					const lexerStory = yield* parser.getLexerStory
					const parserStory = yield* parser.getParserStory
					const env = createEnvironment()
					const evaluation = yield* nodeEvalMatch(env)(program)
					return {
						program,
						evaluation,
						lexerStory,
						parserStory,
					}
				})

			return {
				run,
				runAndInterpret,
			}
		}),
		dependencies: [Parser.Default],
	},
) {}

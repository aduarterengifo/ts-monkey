import { Effect, Match, Schema } from "effect";
import type { ParseError } from "effect/ParseResult";
import { BoolExp } from "src/schemas/nodes/exps/boolean";
import { CallExp } from "src/schemas/nodes/exps/call";
import { FuncExp } from "src/schemas/nodes/exps/function";
import { IdentExp } from "src/schemas/nodes/exps/ident";
import { IfExp } from "src/schemas/nodes/exps/if";
import { InfixExp } from "src/schemas/nodes/exps/infix";
import { IntExp } from "src/schemas/nodes/exps/int";
import { PrefixExp } from "src/schemas/nodes/exps/prefix";
import { StrExp } from "src/schemas/nodes/exps/str";
import type { Exp } from "src/schemas/nodes/exps/union";
import { Program } from "src/schemas/nodes/program";
import { BlockStmt } from "src/schemas/nodes/stmts/block";
import { ExpStmt } from "src/schemas/nodes/stmts/exp";
import { LetStmt } from "src/schemas/nodes/stmts/let";
import { ReturnStmt } from "src/schemas/nodes/stmts/return";
import type { Stmt } from "src/schemas/nodes/stmts/union";
import { TokenType } from "src/schemas/token-types/union";
import type { Token } from "src/schemas/token/unions/all";
import type { KennethParseError } from "../../errors/kenneth/parse";
import { infixOperatorSchema } from "../../schemas/infix-operator";
import type { FnToken } from "../../schemas/token/function-literal";
import { type IdentToken, identTokenSchema } from "../../schemas/token/ident";
import type { IfToken } from "../../schemas/token/if";
import type { IntToken } from "../../schemas/token/int";
import { letTokenSchema } from "../../schemas/token/let";
import { returnTokenSchema } from "../../schemas/token/return";
import type { StringToken } from "../../schemas/token/string";
import type { BoolToken } from "../../schemas/token/unions/boolean";
import {
	type InfixParseFnToken,
	infixParseFnTokenSchema,
} from "../../schemas/token/unions/parse-fn/infix";
import {
	type PrefixParseFnToken,
	prefixParseFnTokenSchema,
} from "../../schemas/token/unions/parse-fn/prefix";
import type { PrefixToken } from "../../schemas/token/unions/prefix";
import { Lexer } from "../lexer";
import { constantFoldingOverStmt } from "./constant-folding";
import {
	LOWEST,
	PREFIX,
	type Precedence,
	tokenTypeToPrecedenceMap,
} from "./precedence";
import { ParserStateService } from "./state";

export class Parser extends Effect.Service<Parser>()("Parser", {
	effect: Effect.gen(function* () {
		const {
			getCurToken,
			getPeekToken,
			setCurTokenAndSave,
			setPeekTokenAndSave,
			getCurTokenHistory,
			getPeekTokenHistory,
		} = yield* ParserStateService;
		const lexer = yield* Lexer;

		const nextToken = Effect.gen(function* () {
			yield* setCurTokenAndSave(yield* getPeekToken);
			yield* setPeekTokenAndSave(yield* lexer.nextToken);
		}).pipe(Effect.withSpan("parser.nextToken"));

		const init = (input: string) =>
			Effect.gen(function* () {
				yield* lexer.init(input);
				yield* nextToken;
				yield* nextToken;
			}).pipe(Effect.withSpan("parser.init"));

		const tokenIs = (token: Token, tokenType: TokenType) =>
			token._tag === tokenType;

		const peekTokenIs = (tokenType: TokenType) =>
			Effect.gen(function* () {
				return tokenIs(yield* getPeekToken, tokenType);
			}).pipe(Effect.withSpan("parser.peekTokenIs"));

		const curTokenIs = (tokenType: TokenType) =>
			Effect.gen(function* () {
				return tokenIs(yield* getCurToken, tokenType);
			}).pipe(Effect.withSpan("parser.curTokenIs"));

		const parseIdentifier = (curToken: IdentToken) =>
			Effect.gen(function* () {
				const identToken =
					yield* Schema.decodeUnknown(identTokenSchema)(curToken);
				return IdentExp.make({ token: identToken, value: identToken.literal });
			}).pipe(Effect.withSpan("parser.parseIdentifier"));

		const parseIntegerLiteral = (curToken: IntToken) =>
			Effect.succeed(
				IntExp.make({ token: curToken, value: Number(curToken.literal) }),
			).pipe(Effect.withSpan("parser.parseIntegerLiteral"));

		const parseBooleanLiteral = (curToken: BoolToken) =>
			Effect.gen(function* () {
				return BoolExp.make({
					token: curToken,
					value: yield* curTokenIs(TokenType.TRUE),
				});
			});

		const parseGroupedExpression = (curToken: Token) =>
			Effect.gen(function* () {
				yield* nextToken;

				const expression = yield* parseExpression(LOWEST);

				// framework handles errors
				yield* expectPeek(TokenType.RPAREN);

				return expression;
			});

		const parseBlockStatement = Effect.gen(function* () {
			const curToken = yield* getCurToken;

			yield* nextToken;

			const stmts: Stmt[] = [];

			while (
				!(yield* curTokenIs(TokenType.RBRACE)) &&
				!(yield* curTokenIs(TokenType.EOF))
			) {
				stmts.push(yield* parseStatement(yield* getCurToken));
				yield* nextToken;
			}

			return BlockStmt.make({ token: curToken, statements: stmts });
		});

		const parseIfExpression = (curToken: IfToken) =>
			Effect.gen(function* () {
				yield* expectPeek(TokenType.LPAREN);

				yield* nextToken;

				const condition = yield* parseExpression(LOWEST);
				yield* expectPeek(TokenType.RPAREN);
				yield* expectPeek(TokenType.LBRACE);

				const consequence = yield* parseBlockStatement;

				let alternative: BlockStmt | undefined = undefined;

				if (yield* peekTokenIs(TokenType.ELSE)) {
					yield* nextToken;

					yield* expectPeek(TokenType.LBRACE);

					alternative = yield* parseBlockStatement;
				}
				return IfExp.make({
					token: curToken,
					condition,
					consequence,
					alternative,
				});
			});

		const parseFunctionParameters = Effect.gen(function* () {
			const identifiers: IdentExp[] = [];
			if (yield* peekTokenIs(TokenType.RPAREN)) {
				yield* nextToken;
				return identifiers;
			}

			yield* nextToken;
			const identToken = yield* Schema.decodeUnknown(identTokenSchema)(
				yield* getCurToken,
			);
			const identExp = IdentExp.make({
				token: identToken,
				value: identToken.literal,
			});
			identifiers.push(identExp);

			while (yield* peekTokenIs(TokenType.COMMA)) {
				yield* nextToken;
				yield* nextToken;
				const identToken = yield* Schema.decodeUnknown(identTokenSchema)(
					yield* getCurToken,
				);
				const identExp = IdentExp.make({
					token: identToken,
					value: identToken.literal,
				});
				identifiers.push(identExp);
			}

			yield* expectPeek(TokenType.RPAREN);

			return identifiers;
		});

		const parseFunctionLiteral = (curToken: FnToken) =>
			Effect.gen(function* () {
				yield* expectPeek(TokenType.LPAREN);
				const parameters = yield* parseFunctionParameters;
				yield* expectPeek(TokenType.LBRACE);

				return FuncExp.make({
					token: curToken,
					parameters,
					body: yield* parseBlockStatement,
				});
			});

		const parseStringLiteral = (curToken: StringToken) =>
			Effect.succeed(StrExp.make({ token: curToken, value: curToken.literal }));

		const getPrefixParseFunction = (token: PrefixParseFnToken) =>
			Match.value(token)
				.pipe(
					Match.tag(TokenType.IDENT, parseIdentifier),
					Match.tag(TokenType.INT, parseIntegerLiteral),
					Match.tag(TokenType.IF, parseIfExpression),
					Match.tag(TokenType.FUNCTION, parseFunctionLiteral),
					Match.tag(TokenType.TRUE, parseBooleanLiteral),
					Match.tag(TokenType.FALSE, parseBooleanLiteral),
					Match.tag(TokenType.BANG, parsePrefixExpression),
					Match.tag(TokenType.MINUS, parsePrefixExpression),
					Match.tag(TokenType.STRING, parseStringLiteral),
					Match.tag(TokenType.LPAREN, parseGroupedExpression),
					Match.exhaustive,
				)
				.pipe(Effect.withSpan("parser.getPrefixParseFunction"));

		const parseExpression = (
			precendence: Precedence,
		): Effect.Effect<Exp, ParseError | KennethParseError, never> =>
			Effect.gen(function* () {
				const curToken = yield* getCurToken;
				const prefixParseFnToken = yield* Schema.decodeUnknown(
					prefixParseFnTokenSchema,
				)(curToken);
				const prefix = yield* getPrefixParseFunction(prefixParseFnToken);
				let leftExp = prefix;

				while (
					!(yield* peekTokenIs(TokenType.SEMICOLON)) &&
					precendence < (yield* peekPrecedence)
				) {
					const peekToken = yield* getPeekToken;

					const infixParseFnToken = yield* Schema.decodeUnknown(
						infixParseFnTokenSchema,
					)(peekToken);

					const infix = yield* getInfixParseFunction(infixParseFnToken);

					yield* nextToken;

					leftExp = yield* infix(leftExp);
				}

				return leftExp;
			}).pipe(Effect.withSpan("parser.parseExpression"));

		// the correct way, would be for curToken to be provided as an argument, that way the types would FLOW.
		// in the current setup, I believe I am getting curToken *twice*.
		const parsePrefixExpression = (curToken: PrefixToken) =>
			Effect.gen(function* () {
				yield* nextToken;

				const prefixExpression = PrefixExp.make({
					token: curToken,
					operator: curToken.literal,
					right: yield* parseExpression(PREFIX),
				});

				return prefixExpression;
			}).pipe(Effect.withSpan("parser.parsePrefixExpression"));

		const expectPeek = (tokenType: TokenType) =>
			Effect.gen(function* () {
				const peekToken = yield* getPeekToken;

				yield* Schema.decodeUnknown(Schema.Literal(tokenType))(peekToken._tag);

				yield* nextToken;
			}).pipe(Effect.withSpan("parser.expectPeek"));

		const parseCallArguments = Effect.gen(function* () {
			const args: Exp[] = [];
			if (yield* peekTokenIs(TokenType.RPAREN)) {
				yield* nextToken;
				return args;
			}

			yield* nextToken;

			args.push(yield* parseExpression(LOWEST));

			while (yield* peekTokenIs(TokenType.COMMA)) {
				yield* nextToken;
				yield* nextToken;

				args.push(yield* parseExpression(LOWEST));
			}

			yield* expectPeek(TokenType.RPAREN);

			return args;
		});

		const parseCallExpression = (fn: Exp) =>
			Effect.gen(function* () {
				return CallExp.make({
					token: yield* getCurToken,
					fn,
					args: yield* parseCallArguments,
				});
			});

		const getInfixParseFunction = (token: InfixParseFnToken) =>
			Effect.succeed(
				Match.value(token).pipe(
					Match.tag(TokenType.PLUS, () => parseInfixExpressions),
					Match.tag(TokenType.MINUS, () => parseInfixExpressions),
					Match.tag(TokenType.SLASH, () => parseInfixExpressions),
					Match.tag(TokenType.ASTERISK, () => parseInfixExpressions),
					Match.tag(TokenType.EQ, () => parseInfixExpressions),
					Match.tag(TokenType.NOT_EQ, () => parseInfixExpressions),
					Match.tag(TokenType.LT, () => parseInfixExpressions),
					Match.tag(TokenType.GT, () => parseInfixExpressions),
					Match.tag(TokenType.EXPONENT, () => parseInfixExpressions),
					Match.tag(TokenType.LPAREN, () => parseCallExpression),
					Match.exhaustive,
				),
			).pipe(Effect.withSpan("parser.getInfixParseFunction"));

		const parseLetStatement = Effect.gen(function* () {
			const curToken = yield* getCurToken;
			const letToken = yield* Schema.decodeUnknown(letTokenSchema)(curToken);
			yield* nextToken;

			const identToken = yield* Schema.decodeUnknown(identTokenSchema)(
				yield* getCurToken,
			); // grosss

			const identifier = IdentExp.make({
				token: identToken as IdentToken,
				value: identToken.literal,
			});

			yield* expectPeek(TokenType.ASSIGN);

			yield* nextToken;

			const value = yield* parseExpression(LOWEST);

			if (yield* peekTokenIs(TokenType.SEMICOLON)) {
				yield* nextToken;
			}

			return LetStmt.make({ name: identifier, token: letToken, value });
		}).pipe(Effect.withSpan("parser.parseLetStatement"));

		const parseReturnStatement = Effect.gen(function* () {
			const curToken = yield* getCurToken;
			const returnToken =
				yield* Schema.decodeUnknown(returnTokenSchema)(curToken);
			yield* nextToken;

			const returnValue = yield* parseExpression(LOWEST);

			if (yield* peekTokenIs(TokenType.SEMICOLON)) {
				yield* nextToken;
			}

			return ReturnStmt.make({ token: returnToken, value: returnValue });
		}).pipe(Effect.withSpan("parser.parseReturnStatement"));

		const parseExpressionStatement = Effect.gen(function* () {
			const curToken = yield* getCurToken;
			const expStmt = ExpStmt.make({
				token: curToken,
				expression: yield* parseExpression(LOWEST),
			});

			if (yield* peekTokenIs(TokenType.SEMICOLON)) {
				yield* nextToken;
			}

			return expStmt;
		}).pipe(Effect.withSpan("parser.parseExpressionStatement"));

		const parseStatement = (curToken: Token) =>
			Match.value(curToken)
				.pipe(
					Match.when({ _tag: TokenType.LET }, () => parseLetStatement),
					Match.when({ _tag: TokenType.RETURN }, () => parseReturnStatement),
					Match.orElse(() => parseExpressionStatement),
				)
				.pipe(Effect.withSpan("parser.parseStatement"));

		const parseProgram = Effect.gen(function* () {
			const statements: Stmt[] = [];

			let curToken = yield* getCurToken;
			while (curToken._tag !== TokenType.EOF) {
				const stmt = yield* parseStatement(curToken);
				statements.push(stmt);
				yield* nextToken;
				curToken = yield* getCurToken;
			}
			const program = Program.make({ token: curToken, statements });
			return program;
		}).pipe(Effect.withSpan("parser.parseProgram"));

		const parseProgramOptimized = Effect.gen(function* () {
			const program = yield* parseProgram;
			const statements = yield* Effect.all(
				program.statements.map(constantFoldingOverStmt),
			);
			return Program.make({ token: program.token, statements });
		}).pipe(Effect.withSpan("parser.parseProgramOptimized"));

		const getPrecedence = (token: Token) =>
			tokenTypeToPrecedenceMap.get(token._tag) ?? LOWEST;

		const curPrecedence = Effect.gen(function* () {
			const curToken = yield* getCurToken;
			return getPrecedence(curToken);
		});

		const peekPrecedence = Effect.gen(function* () {
			const peekToken = yield* getPeekToken;
			return getPrecedence(peekToken);
		});

		const parseInfixExpressions = (left: Exp) =>
			Effect.gen(function* () {
				const curToken = yield* getCurToken;
				const precedence = yield* curPrecedence;
				yield* nextToken;

				const right = yield* parseExpression(precedence);

				const operator = yield* Schema.decodeUnknown(infixOperatorSchema)(
					curToken.literal,
				);

				return InfixExp.make({ token: curToken, left, operator, right });
			});

		const getParserStory = Effect.gen(function* () {
			return {
				curTokenHistory: yield* getCurTokenHistory,
				peekTokenHistory: yield* getPeekTokenHistory,
			};
		});

		return {
			init,
			parseProgram,
			parseProgramOptimized,
			getLexerStory: lexer.getStory,
			getParserStory,
		};
	}),
	dependencies: [Lexer.Default, ParserStateService.Default],
}) {}

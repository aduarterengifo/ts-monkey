import { describe, expect, test } from "bun:test";
import { Effect, LogLevel, Logger, ManagedRuntime } from "effect";
import { TokenType } from "src/schemas/token-types/union";
import { Lexer } from "src/services/lexer";

const lexerTests: [string, string, [TokenType, string][]][] = [
	[
		"simple",
		"=+()",
		[
			[TokenType.ASSIGN, TokenType.ASSIGN],
			[TokenType.PLUS, TokenType.PLUS],
			[TokenType.LPAREN, TokenType.LPAREN],
			[TokenType.RPAREN, TokenType.RPAREN],
		],
	],
	[
		"exponent",
		"return 2 ** 2;",
		[
			[TokenType.RETURN, TokenType.RETURN],
			[TokenType.INT, "2"],
			[TokenType.EXPONENT, TokenType.EXPONENT],
			[TokenType.INT, "2"],
			[TokenType.SEMICOLON, TokenType.SEMICOLON],
		],
	],
	[
		"diff",
		"diff(fn(x) { x })(3)",
		[
			[TokenType.IDENT, "diff"],
			[TokenType.LPAREN, TokenType.LPAREN],
			[TokenType.FUNCTION, TokenType.FUNCTION],
			[TokenType.LPAREN, TokenType.LPAREN],
			[TokenType.IDENT, "x"],
			[TokenType.RPAREN, TokenType.RPAREN],
			[TokenType.LBRACE, TokenType.LBRACE],
			[TokenType.IDENT, "x"],
			[TokenType.RBRACE, TokenType.RBRACE],
			[TokenType.RPAREN, TokenType.RPAREN],
			[TokenType.LPAREN, TokenType.LPAREN],
			[TokenType.INT, "3"],
			[TokenType.RPAREN, TokenType.RPAREN],
		],
	],
	[
		"complicated",
		`let five = 5;
	let ten = 10;
	let add = fn(x, y) {
	x + y;
	};
	let result = add(five, ten);
	!-/*5;
	5 < 10 > 5;
	if (5 < 10) {
	  return true;
	} else {
	  return false;
	}
		
	10 == 10;
	10 != 9;
	"foobar"
	"foo bar"
	[1,2];
	`,
		[
			[TokenType.LET, TokenType.LET],
			[TokenType.IDENT, "five"],
			[TokenType.ASSIGN, TokenType.ASSIGN],
			[TokenType.INT, "5"],
			[TokenType.SEMICOLON, TokenType.SEMICOLON],
			[TokenType.LET, TokenType.LET],
			[TokenType.IDENT, "ten"],
			[TokenType.ASSIGN, TokenType.ASSIGN],
			[TokenType.INT, "10"],
			[TokenType.SEMICOLON, TokenType.SEMICOLON],
			[TokenType.LET, TokenType.LET],
			[TokenType.IDENT, "add"],
			[TokenType.ASSIGN, TokenType.ASSIGN],
			[TokenType.FUNCTION, TokenType.FUNCTION],
			[TokenType.LPAREN, TokenType.LPAREN],
			[TokenType.IDENT, "x"],
			[TokenType.COMMA, TokenType.COMMA],
			[TokenType.IDENT, "y"],
			[TokenType.RPAREN, TokenType.RPAREN],
			[TokenType.LBRACE, TokenType.LBRACE],
			[TokenType.IDENT, "x"],
			[TokenType.PLUS, TokenType.PLUS],
			[TokenType.IDENT, "y"],
			[TokenType.SEMICOLON, TokenType.SEMICOLON],
			[TokenType.RBRACE, TokenType.RBRACE],
			[TokenType.SEMICOLON, TokenType.SEMICOLON],
			[TokenType.LET, TokenType.LET],
			[TokenType.IDENT, "result"],
			[TokenType.ASSIGN, TokenType.ASSIGN],
			[TokenType.IDENT, "add"],
			[TokenType.LPAREN, TokenType.LPAREN],
			[TokenType.IDENT, "five"],
			[TokenType.COMMA, TokenType.COMMA],
			[TokenType.IDENT, "ten"],
			[TokenType.RPAREN, TokenType.RPAREN],
			[TokenType.SEMICOLON, TokenType.SEMICOLON],
			[TokenType.BANG, TokenType.BANG],
			[TokenType.MINUS, TokenType.MINUS],
			[TokenType.SLASH, TokenType.SLASH],
			[TokenType.ASTERISK, TokenType.ASTERISK],
			[TokenType.INT, "5"],
			[TokenType.SEMICOLON, TokenType.SEMICOLON],
			[TokenType.INT, "5"],
			[TokenType.LT, TokenType.LT],
			[TokenType.INT, "10"],
			[TokenType.GT, TokenType.GT],
			[TokenType.INT, "5"],
			[TokenType.SEMICOLON, TokenType.SEMICOLON],
			[TokenType.IF, TokenType.IF],
			[TokenType.LPAREN, TokenType.LPAREN],
			[TokenType.INT, "5"],
			[TokenType.LT, TokenType.LT],
			[TokenType.INT, "10"],
			[TokenType.RPAREN, TokenType.RPAREN],
			[TokenType.LBRACE, TokenType.LBRACE],
			[TokenType.RETURN, TokenType.RETURN],
			[TokenType.TRUE, TokenType.TRUE],
			[TokenType.SEMICOLON, TokenType.SEMICOLON],
			[TokenType.RBRACE, TokenType.RBRACE],
			[TokenType.ELSE, TokenType.ELSE],
			[TokenType.LBRACE, TokenType.LBRACE],
			[TokenType.RETURN, TokenType.RETURN],
			[TokenType.FALSE, TokenType.FALSE],
			[TokenType.SEMICOLON, TokenType.SEMICOLON],
			[TokenType.RBRACE, TokenType.RBRACE],
			[TokenType.INT, "10"],
			[TokenType.EQ, TokenType.EQ],
			[TokenType.INT, "10"],
			[TokenType.SEMICOLON, TokenType.SEMICOLON],
			[TokenType.INT, "10"],
			[TokenType.NOT_EQ, TokenType.NOT_EQ],
			[TokenType.INT, "9"],
			[TokenType.SEMICOLON, TokenType.SEMICOLON],
			[TokenType.STRING, "foobar"],
			[TokenType.STRING, "foo bar"],
			[TokenType.LBRACKET, "["],
			[TokenType.INT, "1"],
			[TokenType.COMMA, ","],
			[TokenType.INT, "2"],
			[TokenType.RBRACKET, "]"],
			[TokenType.SEMICOLON, TokenType.SEMICOLON],
			[TokenType.EOF, TokenType.EOF],
		],
	],
];

describe("lexer", () => {
	for (const [desc, input, expected] of lexerTests) {
		test(desc, () => {
			ManagedRuntime.make(Lexer.Default).runPromise(program(input, expected));
		});
	}
});

const program = (input: string, expected: [TokenType, string][]) =>
	Effect.gen(function* () {
		const lexer = yield* Lexer;
		yield* lexer.init(input);

		for (const [expectedType, expectedLiteral] of expected) {
			const token = yield* lexer.nextToken;
			expect(token._tag).toBe(expectedType);
			expect(token.literal).toBe(expectedLiteral);
		}
	}).pipe(Logger.withMinimumLogLevel(LogLevel.Debug));

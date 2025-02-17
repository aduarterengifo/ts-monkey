import { Effect, Either, Match } from 'effect'
import { LexerStateService } from './state'
import { lookupIndent } from '../tokens'
import { decodeUnknownEither } from 'effect/Schema'
import { lexerSymbolSchema } from '../../schemas/chars/next-token'
import { TokenType } from '../../schemas/token-types/union'
import type { Token } from '../../schemas/token/unions/all'

export class Lexer extends Effect.Service<Lexer>()('Lexer', {
	effect: Effect.gen(function* () {
		const {
			getInput,
			setInput,
			getPos1,
			getPos2,
			incPos2,
			getChar,
			setChar,
			setPos1,
			getTokens,
			saveToken,
			getPos1History,
			getPos2History,
			saveToPos1History,
			saveToPos2History,
		} = yield* LexerStateService

		const init = setInput

		const readChar = Effect.gen(function* () {
			const input = yield* getInput
			const pos2 = yield* getPos2

			if (pos2 >= input.length) {
				yield* setChar('\0')
			} else {
				yield* setChar(input[pos2])
			}
			yield* setPos1(pos2)
			yield* incPos2

			yield* saveToPos1History(yield* getPos1)
			yield* saveToPos2History(yield* getPos2)
		})

		const peekChar = Effect.gen(function* () {
			const input = yield* getInput
			const pos2 = yield* getPos2
			return pos2 >= input.length ? 0 : input[pos2]
		})

		const newToken = (tokenType: TokenType, ch: string): Token => ({
			_tag: tokenType,
			literal: ch,
		})

		// ---

		const read = (pattern: RegExp, type: string) =>
			Effect.gen(function* () {
				const position = yield* getPos1
				while (pattern.test(yield* getChar)) {
					yield* readChar
				}
				const input = yield* getInput

				const newPosition = yield* getPos1
				const res = input.slice(position, newPosition)
				return res
			})

		const readIdentifier = read(/[a-zA-Z_]/, 'Identifier')
		const readNumber = read(/\d/, 'Number')
		const eatWhiteSpace = Effect.gen(function* () {
			const whitespaceChars = [' ', '\t', '\n', '\r']
			while (whitespaceChars.includes(yield* getChar)) {
				yield* readChar
			}
		})

		const singleCharLookAhead = (
			firstChar: string,
			expectedSecond: string,
			matchedType: TokenType,
			defaultType: TokenType,
		): Effect.Effect<Token, never, never> =>
			Effect.gen(function* () {
				const ch = yield* getChar
				yield* readChar
				const ch2 = yield* getChar
				if (ch2 === expectedSecond) {
					yield* readChar
					return newToken(matchedType, `${ch}${ch2}`)
				}
				return newToken(defaultType, firstChar)
			})

		const newTokenAndReadChar =
			(tokenType: TokenType) =>
			(ch: string): Effect.Effect<Token, never, never> =>
				Effect.gen(function* () {
					yield* readChar
					return newToken(tokenType, ch)
				})

		const readString = Effect.gen(function* () {
			const position = yield* getPos1
			while (true) {
				yield* readChar
				const ch = yield* getChar
				if (ch === '"' || ch === '\0') {
					break
				}
			}
			const input = yield* getInput
			return input.slice(position + 1, yield* getPos1)
		})

		const getStory = Effect.gen(function* () {
			return {
				input: yield* getInput,
				tokens: yield* getTokens,
				pos1History: yield* getPos1History,
				pos2History: yield* getPos2History,
			}
		})

		const nextToken: Effect.Effect<Token, never, never> = Effect.gen(
			function* () {
				yield* eatWhiteSpace
				const ch = yield* getChar

				const decodedCh = decodeUnknownEither(lexerSymbolSchema)(ch)

				const token = yield* Either.match(decodedCh, {
					onLeft: (left) =>
						Effect.gen(function* () {
							if (/[a-zA-Z_]/.test(ch)) {
								const tokenLiteral = yield* readIdentifier
								return newToken(lookupIndent(tokenLiteral), tokenLiteral)
							}
							if (/\d/.test(ch)) {
								return newToken(TokenType.INT, yield* readNumber)
							}
							return yield* newTokenAndReadChar(TokenType.ILLEGAL)('')
						}),
					onRight: (right) =>
						Effect.gen(function* () {
							return yield* Match.value(right).pipe(
								Match.when(TokenType.ASSIGN, () =>
									singleCharLookAhead(
										TokenType.ASSIGN,
										TokenType.ASSIGN,
										TokenType.EQ,
										TokenType.ASSIGN,
									),
								),
								Match.when(TokenType.BANG, () =>
									singleCharLookAhead(
										TokenType.BANG,
										TokenType.ASSIGN,
										TokenType.NOT_EQ,
										TokenType.BANG,
									),
								),
								Match.when(TokenType.MINUS, () =>
									newTokenAndReadChar(TokenType.MINUS)(ch),
								),
								Match.when(TokenType.EXPONENT, () =>
									newTokenAndReadChar(TokenType.EXPONENT)(ch),
								),
								Match.when(TokenType.SLASH, () =>
									newTokenAndReadChar(TokenType.SLASH)(ch),
								),
								Match.when(TokenType.ASTERISK, () =>
									singleCharLookAhead(
										TokenType.ASTERISK,
										TokenType.ASTERISK,
										TokenType.EXPONENT,
										TokenType.ASTERISK,
									),
								),
								Match.when(TokenType.LT, () =>
									newTokenAndReadChar(TokenType.LT)(ch),
								),
								Match.when(TokenType.GT, () =>
									newTokenAndReadChar(TokenType.GT)(ch),
								),
								Match.when(TokenType.SEMICOLON, () =>
									newTokenAndReadChar(TokenType.SEMICOLON)(ch),
								),
								Match.when(TokenType.LPAREN, () =>
									newTokenAndReadChar(TokenType.LPAREN)(ch),
								),
								Match.when(TokenType.RPAREN, () =>
									newTokenAndReadChar(TokenType.RPAREN)(ch),
								),
								Match.when(TokenType.COMMA, () =>
									newTokenAndReadChar(TokenType.COMMA)(ch),
								),
								Match.when(TokenType.PLUS, () =>
									newTokenAndReadChar(TokenType.PLUS)(ch),
								),
								Match.when(TokenType.LBRACE, () =>
									newTokenAndReadChar(TokenType.LBRACE)(ch),
								),
								Match.when(TokenType.RBRACE, () =>
									newTokenAndReadChar(TokenType.RBRACE)(ch),
								),
								Match.when(TokenType.EOF, () =>
									newTokenAndReadChar(TokenType.EOF)(ch),
								),
								Match.when(TokenType.QUOTE, function* () {
									return yield* newTokenAndReadChar(TokenType.STRING)(
										yield* readString,
									)
								}),
								Match.exhaustive,
							)
						}),
				})
				yield* saveToken(token)
				return token
			},
		)

		// ---

		return {
			init,
			readChar,
			peekChar,
			newToken,
			readIdentifier,
			readNumber,
			eatWhiteSpace,
			singleCharLookAhead,
			newTokenAndReadChar,
			getStory,
			nextToken,
		}
	}),
	dependencies: [LexerStateService.Default],
}) {}

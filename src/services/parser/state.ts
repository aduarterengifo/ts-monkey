import { Context, Effect, Layer, Ref } from 'effect'
import { TokenType } from '../../schemas/token-types/union'
import type { Token } from 'src/schemas/token/unions/all'

export class ParserState {
	getCurToken: Effect.Effect<Token>
	getPeekToken: Effect.Effect<Token>
	setCurToken: (newCurToken: Token) => Effect.Effect<void>
	setPeekToken: (newPeekToken: Token) => Effect.Effect<void>
	getCurTokenHistory: Effect.Effect<Token[]>
	saveToCurTokenHistory: (token: Token) => Effect.Effect<void>
	getPeekTokenHistory: Effect.Effect<Token[]>
	saveToPeekTokenHistory: (token: Token) => Effect.Effect<void>
	setCurTokenAndSave: (newCurToken: Token) => Effect.Effect<void>
	setPeekTokenAndSave: (newPeekToken: Token) => Effect.Effect<void>

	constructor(
		private curToken: Ref.Ref<Token>,
		private peekToken: Ref.Ref<Token>,
		private curTokenHistory: Ref.Ref<Token[]>,
		private peekTokenHistory: Ref.Ref<Token[]>,
	) {
		this.getCurToken = Ref.get(this.curToken)
		this.getPeekToken = Ref.get(this.peekToken)
		this.setCurToken = (newCurToken) =>
			Ref.update(this.curToken, (_) => newCurToken)
		this.setPeekToken = (newPeekToken) =>
			Ref.update(this.peekToken, (_) => newPeekToken)
		this.getCurTokenHistory = Ref.get(this.curTokenHistory)
		this.getPeekTokenHistory = Ref.get(this.peekTokenHistory)
		this.saveToCurTokenHistory = (curToken) =>
			Effect.gen(function* () {
				yield* Ref.update(curTokenHistory, (curTokenHistory) => {
					return [...curTokenHistory, curToken]
				})
			})
		this.saveToPeekTokenHistory = (peekToken) =>
			Effect.gen(function* () {
				yield* Ref.update(peekTokenHistory, (peekTokenHistory) => {
					return [...peekTokenHistory, peekToken]
				})
			})
		this.setCurTokenAndSave = (newCurToken) =>
			Effect.gen(function* () {
				yield* Ref.update(curToken, (_) => newCurToken)
				yield* Ref.update(curTokenHistory, (curTokenHistory) => {
					return [...curTokenHistory, newCurToken]
				})
			})
		this.setPeekTokenAndSave = (newPeekToken) =>
			Effect.gen(function* () {
				yield* Ref.update(peekToken, (_) => newPeekToken)
				yield* Ref.update(curTokenHistory, (curTokenHistory) => {
					return [...curTokenHistory, newPeekToken]
				})
			})
	}

	static make = () =>
		Effect.gen(function* (_) {
			const curToken = yield* Ref.make({
				_tag: TokenType.ILLEGAL,
				literal: '',
			} as Token)

			const peekToken = yield* Ref.make({
				_tag: TokenType.ILLEGAL,
				literal: '',
			} as Token)

			const curTokenHistory = yield* Ref.make<Token[]>([])
			const peekTokenHistory = yield* Ref.make<Token[]>([])
			return new ParserState(
				curToken,
				peekToken,
				curTokenHistory,
				peekTokenHistory,
			)
		})
}

export class ParserStateService extends Context.Tag('ParserStateService')<
	ParserStateService,
	ParserState
>() {
	static readonly Default = Layer.effect(this, ParserState.make())
}

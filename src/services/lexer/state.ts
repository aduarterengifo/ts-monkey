import { Context, Effect, Layer, Ref } from 'effect'
import type { Token } from 'src/schemas/token/unions/all'

export type LexerStateAll = Effect.Effect.Success<LexerState['getAll']>

export class LexerState {
	incPos1: Effect.Effect<void>
	decPos1: Effect.Effect<void>
	getPos1: Effect.Effect<number>
	incPos2: Effect.Effect<void>
	getInput: Effect.Effect<string>
	decPos2: Effect.Effect<void>
	getPos2: Effect.Effect<number>
	getChar: Effect.Effect<string>
	setChar: (newChar: string) => Effect.Effect<void>
	setPos1: (newPos: number) => Effect.Effect<void>
	setPos2: (newPos2: number) => Effect.Effect<void>
	setInput: (newInput: string) => Effect.Effect<void>
	getAll: Effect.Effect<{
		input: string
		pos1: number
		pos2: number
		char: string
	}>
	saveToken: (token: Token) => Effect.Effect<void>
	getTokens: Effect.Effect<Token[]>
	getPos1History: Effect.Effect<number[][]>
	saveToPos1History: (pos1: number) => Effect.Effect<void>
	getPos2History: Effect.Effect<number[][]>
	saveToPos2History: (pos2: number) => Effect.Effect<void>

	constructor(
		// execution
		private input: Ref.Ref<string>,
		private pos1: Ref.Ref<number>,
		private pos2: Ref.Ref<number>,
		private char: Ref.Ref<string>,
		// interpretation
		private tokens: Ref.Ref<Token[]>,
		private pos1History: Ref.Ref<number[][]>,
		private pos2History: Ref.Ref<number[][]>,
	) {
		this.getInput = Ref.get(this.input)
		this.getChar = Ref.get(this.char)
		this.incPos1 = Ref.update(this.pos1, (n) => n + 1)
		this.decPos1 = Ref.update(this.pos1, (n) => n - 1)
		this.getPos1 = Ref.get(this.pos1)
		this.incPos2 = Ref.update(this.pos2, (n) => n + 1)
		this.decPos2 = Ref.update(this.pos2, (n) => n - 1)
		this.getPos2 = Ref.get(this.pos2)
		this.setChar = (newChar: string) => Ref.update(this.char, () => newChar)
		this.setPos1 = (newPos1: number) => Ref.update(this.pos1, () => newPos1)
		this.setPos2 = (newPos2: number) => Ref.update(this.pos2, () => newPos2)
		this.setInput = (newInput: string) =>
			Effect.gen(function* () {
				yield* Ref.set(input, newInput)
				yield* Ref.set(pos1, 0)
				yield* Ref.set(pos2, 1)
				yield* Ref.set(char, newInput[0])
			})
		this.getAll = Effect.gen(function* () {
			return {
				input: yield* Ref.get(input),
				pos1: yield* Ref.get(pos1),
				pos2: yield* Ref.get(pos2),
				char: yield* Ref.get(char),
			}
		})
		// Interpretability. TODO: From a perfomance persepective, this should be separate.
		// FROM a performace perspective the only true zero-cost intepretability addition
		// that is viable would be a clever wrapper thing. (apart from language level ability to fully turn off code.)
		this.getTokens = Ref.get(this.tokens)
		this.saveToken = (token: Token) =>
			Ref.update(this.tokens, (tokens) => [...tokens, token])
		this.getPos1History = Ref.get(this.pos1History)
		this.getPos2History = Ref.get(this.pos2History)
		this.saveToPos1History = (pos1: number) =>
			Effect.gen(function* () {
				const tks = yield* Ref.get(tokens)
				yield* Ref.update(pos1History, (pos1History) => {
					const tokensLength = tks.length
					if (!Array.isArray(pos1History[tokensLength])) {
						pos1History.push([pos1])
					} else {
						pos1History[tokensLength].push(pos1)
					}
					return pos1History
				})
			})
		this.saveToPos2History = (pos2: number) =>
			Effect.gen(function* () {
				const tks = yield* Ref.get(tokens)
				yield* Ref.update(pos2History, (pos2History) => {
					const tokensLength = tks.length
					if (!Array.isArray(pos2History[tokensLength])) {
						pos2History.push([pos2])
					} else {
						pos2History[tokensLength].push(pos2)
					}
					return pos2History
				})
			})

		// Interpretability
	}

	static make = (input: Ref.Ref<string>) =>
		Effect.gen(function* () {
			const pos1 = yield* Ref.make(0)
			const pos2 = yield* Ref.make(1)
			const char = yield* Ref.make(
				yield* Ref.get(input).pipe(Effect.map((str) => str[0])),
			)
			const tokens = yield* Ref.make<Token[]>([])
			const pos1History = yield* Ref.make<number[][]>([])
			const pos2History = yield* Ref.make<number[][]>([])

			return new LexerState(
				input,
				pos1,
				pos2,
				char,
				tokens,
				pos1History,
				pos2History,
			)
		})
}

export class LexerStateService extends Context.Tag('LexerStateService')<
	LexerStateService,
	LexerState
>() {
	static readonly make = (input: string) =>
		Layer.effect(
			this,
			Effect.andThen(Ref.make(input), (inputRef) => LexerState.make(inputRef)),
		)
	static readonly Default = Layer.effect(
		this,
		Effect.andThen(Ref.make(''), (inputRef) => LexerState.make(inputRef)),
	)
}

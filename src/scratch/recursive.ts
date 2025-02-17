// import { Console, Effect } from 'effect'
// import { Schema } from 'effect'

// // interface Exp1 extends Schema.Schema.Encoded<typeof Exp1> {
// // 	type: 'expression'
// // 	value: number | ExpEncoded
// // }

// // interface Exp2 extends Schema.Schema.Encoded<typeof Exp2> {
// // 	type: 'expression'
// // 	value: string
// // }xqx

// // interface Exp3 extends Schema.Schema.Encoded<typeof Exp3> {
// // 	type: 'expression'
// // 	value: string
// // }

// class Exp2 extends Schema.TaggedClass<Exp2>()('Exp2', {
// 	value: Schema.String,
// }) {
// 	expressionNode() {}
// }

// type Exp1E = {
// 	_tag: 'Exp1'
// 	value: ExpEncoded
// }

// class Exp1 extends Schema.TaggedClass<Exp1>()('Exp1', {
// 	value: Schema.suspend((): Schema.Schema<Exp, ExpEncoded> => Exp),
// }) {
// 	expressionNode() {}
// }

// export type Exp1Encoded = Omit<Schema.Schema.Encoded<typeof Exp1>, 'value'>
// export type Exp2Encoded = Schema.Schema.Encoded<typeof Exp2>
// // export type Exp3Encoded = Schema.Schema.Encoded<typeof Exp3>

// export type Exp = Exp1 | Exp2
// export type ExpEncoded = Exp1E | Exp2Encoded
// // export type ExpEncoded = Schema.Schema.Encoded<typeof Exp>

// // export type ExpEncoded = Exp1Encoded | Exp2Encoded | Exp3Encoded

// const Exp = Schema.Union(Exp1, Exp2)

// const program = Effect.gen(function* () {
// 	yield* Console.log(
// 		Schema.decodeUnknownSync(Exp)({
// 			_tag: 'Exp1',
// 			value: {
// 				_tag: 'Exp2',
// 				value: 'cow',
// 			},
// 		}),
// 	)
// 	// yield* Effect.log('Welcome to the Effect Playground!')
// 	// const exp2 = new Exp2({ type: 'expression', value: 'something' })
// 	// const exp1 = new Exp1({ type: 'expression', value: exp2 })
// 	// if (typeof exp1.value === 'number') {
// 	// } else {
// 	// 	yield* Effect.log(exp1.value.value)
// 	// }
// }).pipe(
// 	Effect.withSpan('program', {
// 		attributes: { source: 'Playground' },
// 	}),
// )

// Effect.runSync(program)

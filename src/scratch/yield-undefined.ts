// import { Effect } from 'effect'

// const program = Effect.gen(function* () {
// 	let cow: { hey: Effect.Effect<string, never, never> } | undefined = {
// 		hey: Effect.succeed('hey'),
// 	}
// 	cow = Math.random() < 0.5 ? undefined : { hey: Effect.succeed('hey') }

// 	return yield* cow?.hey
// })

// Import necessary modules from the libraries
import { Args, Command } from '@effect/cli'
import { Terminal } from '@effect/platform'
import { BunContext, BunRuntime } from '@effect/platform-bun'
import { Console, Effect, Layer } from 'effect'
import { PROMPT } from './repl/constants'
import { Parser } from './parser'
import { Eval } from './evaluator'
import { createEnvironment } from './object/environment'

// Define the top-level command
const topLevel = Command.make('hello-world', {}, () =>
	Console.log('Hello friend, welcome to the Monkey programming language'),
)

// Define a text argument
const text = Args.text({ name: 'text' })

// Create a command that logs the provided text argument to the console
// this takes text I want to return tokens on input
const echoCommand = Command.make('echo', { text }, ({ text }) =>
	Console.log(text),
)

const replCommand = Command.make(
	'repl',
	{},
	() =>
		Effect.gen(function* () {
			const terminal = yield* Terminal.Terminal
			const env = createEnvironment()
			while (true) {
				yield* terminal.display(`${PROMPT}`)
				const input = yield* terminal.readLine
				const parser = yield* Parser
				yield* parser.init(input)
				const program = yield* parser.parseProgram
				const evaluation = yield* Eval(program)(env)
				yield* Console.log(evaluation.inspect())
			}
		}),
	// Console.log(input),
)

const command = topLevel.pipe(
	Command.withSubcommands([echoCommand, replCommand]),
)

// Set up the CLI application
const cli = Command.run(command, {
	name: 'Hello World CLI',
	version: 'v1.0.0',
})

// Prepare and run the CLI application
cli(process.argv).pipe(
	Effect.provide(Layer.mergeAll(Parser.Default, BunContext.layer)),
	BunRuntime.runMain,
)

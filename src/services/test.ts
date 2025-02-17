import { Terminal } from "@effect/platform"
import { NodeRuntime, NodeTerminal } from "@effect/platform-node"
import { Effect } from "effect"
import { PROMPT } from "./repl/constants"

const program = Effect.gen(function*() {
  const terminal = yield* Terminal.Terminal
  while (true) {
    yield* terminal.display(`\n${PROMPT}`)
    const input = yield* terminal.readLine
    yield* terminal.display(input)
  }
})

NodeRuntime.runMain(program.pipe(Effect.provide(NodeTerminal.layer)))
// Input: "hello"
// Output: "input: hello"

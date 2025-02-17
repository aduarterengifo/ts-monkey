import { Effect } from "effect"
import { LexerStateService } from "../lexer/state"

export class REPL extends Effect.Service<REPL>()("REPL", {
  effect: Effect.gen(function*() {
    const {} = yield* LexerStateService
    return {}
  }),
  dependencies: []
}) {}

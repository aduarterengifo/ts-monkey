import { Console, Effect } from 'effect'
import { Schema } from 'effect'
import { nativeToExp } from 'src/schemas/nodes/exps/union'
import { ReturnStmt } from 'src/schemas/nodes/stmts/return'
import { isExpStmt, type Stmt, stmtSchema } from 'src/schemas/nodes/stmts/union'

const program = Effect.gen(function* () {
	const istmt = nativeToExp(6)
	const rstmt = new ReturnStmt({
		token: { _tag: 'let', literal: 'let' },
		value: istmt,
	}) as Stmt
	yield* Console.log(Schema.decodeUnknownSync(stmtSchema)(rstmt))

	if (isExpStmt(rstmt)) {
		console.log(`${rstmt.string()}`)
	}
}).pipe(
	Effect.withSpan('program', {
		attributes: { source: 'Playground' },
	}),
)

Effect.runSync(program)

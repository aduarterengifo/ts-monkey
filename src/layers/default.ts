import { Layer } from 'effect'
import { Lexer } from '../services/lexer'
import { LexerStateService } from '../services/lexer/state'
import { Parser } from '../services/parser'
import { ParserStateService } from '../services/parser/state'
import { Evaluator } from '../services/evaluator'

export const defaultLayer = Layer.mergeAll(
	Lexer.Default,
	LexerStateService.Default,
	Parser.Default,
	ParserStateService.Default,
	Evaluator.Default,
)

import { Data } from 'effect'
import type { TokenType } from 'src/schemas/token-types/union'

export class KennethEvalError extends Data.TaggedError('KennethEvalError')<{
	message: string
	file?: string
	expected?: TokenType
	actual?: TokenType
}> {}

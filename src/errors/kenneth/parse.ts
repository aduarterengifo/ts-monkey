import { Data } from 'effect'
import type { TokenType } from 'src/schemas/token-types/union'

export class KennethParseError extends Data.TaggedError('KennethParseError')<{
	message: string
	file?: string
	expected?: TokenType
	actual?: TokenType
}> {}

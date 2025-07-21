# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Effect-based TypeScript implementation of the Monkey programming language interpreter from "Writing An Interpreter In Go", with extensions for symbolic differentiation. The project includes:

- A complete lexer, parser, and evaluator for the Monkey language
- Symbolic differentiation capabilities supporting constant, sum, power, product, quotient, and chain rules
- A web-based REPL interface built with React and Vite
- Trigonometric derivatives implementation

## Development Commands

### Core Development
- `pnpm test` - Run tests with Bun
- `pnpm vitest` - Run tests with Vitest
- `pnpm coverage` - Generate test coverage reports
- `pnpm check` - TypeScript type checking
- `pnpm lint` - Run ESLint on codebase
- `pnpm lint-fix` - Auto-fix lint issues

### Application
- `pnpm repl` - Start the CLI REPL interface
- `pnpm dev` - Start Vite development server for web interface
- `pnpm build` - Build the project

### Testing
- Run single test file: `bunx vitest src/tests/vitest/eval/eval.test.ts`
- Run specific test pattern: `bunx vitest --grep "pattern"`

## Architecture

### Core Services (Effect-based)
The interpreter follows a traditional lexer → parser → evaluator pipeline, implemented using Effect-TS:

- **Lexer** (`src/services/lexer/`) - Tokenizes input strings using state management services
- **Parser** (`src/services/parser/`) - Builds AST from tokens with precedence-based parsing
- **Evaluator** (`src/services/evaluator/`) - Interprets AST nodes and manages runtime environment

### Schema System
The codebase uses a comprehensive schema system in `src/schemas/`:
- `nodes/` - AST node definitions (expressions, statements, program)
- `objs/` - Runtime object representations 
- `token/` - Token type definitions
- Built-in function schemas and differentiation schemas

### Key Architectural Patterns
- **Effect Services**: Core functionality implemented as Effect services with dependency injection
- **Schema Validation**: Extensive use of Effect Schema for type-safe parsing and validation
- **Functional Programming**: Immutable data structures and functional composition throughout
- **Error Handling**: Effect-based error handling with typed error channels

### Differentiation Engine
Located in `src/services/diff/`, implements symbolic differentiation:
- `obj.ts` - Core differentiation logic for different object types
- `helper.ts` - Utility functions for differentiation operations
- Supports polynomial objects and various mathematical operations

### Testing Structure
- Unit tests in `src/tests/vitest/` organized by functionality
- Parser tests focus on AST construction correctness
- Evaluator tests verify runtime behavior and differentiation accuracy
- Helper utilities in test directories for common test patterns

## Entry Points
- CLI REPL: `src/services/cli.ts`
- Web interface: `src/vite/main.tsx`
- Core interpreter: `src/services/evaluator/index.ts`
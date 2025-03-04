import { expect, it } from "@effect/vitest";
import { Effect } from "effect";

// A simple divide function that returns an Effect, failing when dividing by zero
function divide(a: number, b: number) {
	if (b === 0) return Effect.fail("Cannot divide by zero");
	return Effect.succeed(a / b);
}

// Testing a successful division
it.effect("test success", () =>
	Effect.gen(function* () {
		const result = yield* divide(4, 2); // Expect 4 divided by 2 to succeed
		expect(result).toBe(2); // Assert that the result is 2
	}),
);

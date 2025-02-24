import { Evaluator } from "@/services/evaluator";
import { objInspect } from "@/services/object";
import { Parser } from "@/services/parser";
import { NodeSdk } from "@effect/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Effect, Layer, ManagedRuntime } from "effect";

// Function to simulate a task with possible subtasks
const task = (
	name: string,
	delay: number,
	children: ReadonlyArray<Effect.Effect<void>> = [],
) =>
	Effect.gen(function* () {
		yield* Effect.log(name);
		yield* Effect.sleep(`${delay} millis`);
		for (const child of children) {
			yield* child;
		}
		yield* Effect.sleep(`${delay} millis`);
	}).pipe(Effect.withSpan(name));

const poll = task("/poll", 1);

// Create a program with tasks and subtasks
const exampleProgram = task("client", 2, [
	task("/api", 3, [
		task("/authN", 4, [task("/authZ", 5)]),
		task("/payment Gateway", 6, [task("DB", 7), task("Ext. Merchant", 8)]),
		task("/dispatch", 9, [
			task("/dispatch/search", 10),
			Effect.all([poll, poll, poll], { concurrency: "inherit" }),
			task("/pollDriver/{id}", 11),
		]),
	]),
]);

const NodeSdkLive = NodeSdk.layer(() => ({
	resource: { serviceName: "example" },
	spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

Effect.runPromise(
	exampleProgram.pipe(
		Effect.provide(NodeSdkLive),
		Effect.catchAllCause(Effect.logError),
	),
);

const program = (input: string) =>
	Effect.gen(function* () {
		const evaluator = yield* Evaluator;
		const returnValue = yield* evaluator.runAndInterpret(input);
		const evaluated = objInspect(returnValue.evaluation);
		return evaluated;
	});

ManagedRuntime.make(
	Layer.mergeAll(Parser.Default, Evaluator.Default),
).runPromise(
	program("diff(fn (x) { 1 / (2 * x + 3) })(3)").pipe(
		Effect.provide(NodeSdkLive),
		Effect.catchAllCause(Effect.logError),
	),
);

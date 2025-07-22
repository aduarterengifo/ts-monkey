import { Evaluator } from "@/services/evaluator";
import { objInspect } from "@/services/object";
import { Parser } from "@/services/parser";
import { NodeSdk } from "@effect/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Effect, Layer, ManagedRuntime } from "effect";

// Create a program with tasks and subtasks

const NodeSdkLive = NodeSdk.layer(() => ({
	resource: { serviceName: "diff" },
	spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

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

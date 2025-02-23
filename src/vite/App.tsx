import { objInspect } from "@/services/object";
import { Match } from "effect";
import { useState } from "react";
import { Textarea } from "../components/ui/textarea";
import { runAndInterpret } from "../programs/run-and-interpret";
import { examples } from "./examples";

const PROMPT = ">>";

function App() {
	const [count, setCount] = useState(0);
	const [text, setText] = useState(PROMPT);
	const [instructions, setInstructions] = useState("");
	const [evaluations, setEvaluations] = useState<string[]>([]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.ctrlKey && e.key === "c") {
			setText((prevText) => `\n${PROMPT}`);
			e.preventDefault();
		}
	};

	const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newText = e.target.value;
		setText(newText);
		if (newText.charAt(newText.length - 1) === "\n") {
			console.log("enter");
			const userInput = newText
				.substring(newText.lastIndexOf(PROMPT) + PROMPT.length)
				.trim();
			if (userInput.toLowerCase() === "clear") {
				setText((prevText) => `${PROMPT}`);
				return;
			}
			const returnValue = await runAndInterpret(instructions + userInput);

			setInstructions(
				(prevInstructions) =>
					`${prevInstructions}${newText.substring(newText.lastIndexOf(PROMPT) + PROMPT.length).trim()}\n`,
			);
			console.log("instructions", instructions);
			const evaluated = Match.value(returnValue).pipe(
				Match.tag("ErrorObj", (errorObj) => {
					return errorObj.message;
				}),
				Match.orElse((r) => {
					return objInspect(r.evaluation);
				}),
			);

			setEvaluations((evals) => [...evals, evaluated]);

			setText((prevText) => `${prevText}${evaluated}\n${PROMPT}`);
		}
	};
	return (
		<div className="font-mono">
			<div className="flex flex-col items-start pb-2 pl-2 w-[80ch]">
				ts-monkey repl
			</div>
			<Textarea
				value={text}
				onKeyDown={handleKeyDown}
				onChange={handleChange}
				className="resize-none h-80 w-full"
			/>
			<div className="flex flex-col items-start w-full">
				{examples.map((str, i) => (
					<div className="text-left" key={`example-${i}`}>
						{str}
					</div>
				))}
			</div>
		</div>
	);
}

export default App;

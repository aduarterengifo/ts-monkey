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

	const handleEnter = async (newText: string) => {
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
	};

	const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newText = e.target.value;
		setText(newText);
		if (newText.charAt(newText.length - 1) === "\n") {
			await handleEnter(newText);
		}
	};
	return (
		<div className="grid place-items-center h-screen">
			<div className="relative w-[40ch] lg:w-[80ch]">
				<div className="flex flex-col items-start absolute -top-10 left-3">
					ts-monkey repl
				</div>
				<Textarea
					value={text}
					onKeyDown={handleKeyDown}
					onChange={handleChange}
					className="resize-none h-80 w-full"
				/>
				<div className="flex flex-col items-start w-full absolute top-90 left-0 h-40 overflow-y-scroll gap-2">
					{examples.map((str, i) => (
						<button
							type="button"
							className="text-left pl-3 cursor-pointer"
							key={`example-${i}`}
							onClick={(e) => {
								const txt = `${PROMPT} ${str}\n`;
								setText((prevText) => txt);
								handleEnter(txt);
							}}
						>
							{str}
						</button>
					))}
				</div>
			</div>
			{/* 
			<div className="flex flex-col items-start w-full">
				{examples.map((str, i) => (
					<div className="text-left" key={`example-${i}`}>
						{str}
					</div>
				))}
			</div> */}
		</div>
	);
}

export default App;

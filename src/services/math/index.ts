export const secSquared = (x: number) => 1 / Math.cos(x) ** 2;

// expression: PrefixExp.make({
// 	token: {
// 		_tag: "-",
// 		literal: "-",
// 	},
// 	operator: "-",
// right: CallExp.make({
// 	token: {
// 		_tag: "(",
// 		literal: "(",
// 	},
// 	fn: IdentExp.make({
// 		token: {
// 			_tag: "IDENT",
// 			literal: "sin",
// 		},
// 		value: "sin",
// 	}),
// 	args: [x],
// }),
// });

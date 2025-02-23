import nerdamer from "nerdamer-prime";

nerdamer.setFunction("g(y)=y^3");

const e = nerdamer("diff(2 * g(x) + x,x)");

const b = nerdamer("diff(x^2+2*(cos(x)+x*x),x)");

console.log(e.text());

console.log(b.text());

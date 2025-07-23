# effect-monkey

[effect](https://effect.website) implementation of monkey interpreter from [Writing An Interpreter In Go](https://interpreterbook.com)

with extensions for symbolic differentiation.

## Symbolic Differentiation 

- [x] constant rule
- [x] sum rule
- [x] power rule
- [x] product rule
- [x] quotient rule
- [x] chain rule

## REPL 

[repl](https://monkey.andres.duarterengifo.com)


## TODO 

- [x] view local traces 
- [ ] arrays 
- [ ] hashes
- [ ] diff multi-statement functions 
- [ ] graph functions 
- [x] trig derivatives
  - [ ] integrate with chain rule
- [ ] exp/ln derivatives 
  - [ ] integrate with chain rule
- [ ] partial derivatives 
    -  [ ] pass ident as second arg. 
- [ ] release as package
- [ ] errors should error

## WHY 

But, why?

Why would you want symbolic differentation at the language level?

#### Alternative

```ts
import {nerdamer} from 'nerdamer'

const fPrime = nerdamer('diff(x^2+2*(cos(x)+x*x),x)')
```

Pitfalls 

to the compiler the diff expression is just a string, 
so we are not 
- protected from typos.
- supported by linters. 

```ts
const fPrime = nerdamer('diff(x^2+2*(cos(x+x*x),x)')
```

composition breaks down.

```ts 
let f = `sin(x)`
let g = `3x + 2`

diff(?)
```

vs

```ts 
let f = fn(x) { sin(x) }
let g = fn(x) { 3x + 2 }

diff(f(g))
```


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
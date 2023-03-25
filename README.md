# Func compiler

A compiler for Func, a high-level, general-purpose, statically typed, garbage collected,
purely functional programming language with type inference.

The language is mostly based on ML, Haskell, and JavaScript.

## How to try it out

It's best to check out the demo and tutorial available at https://sodic.github.io/func.

The thesis is available at https://sodic.github.io/func-thesis.pdf.

## Using the compiler locally

Clone the repository, position yourself in the root directory:

```bash
git clone https://github.com/sodic/func
cd func
```
Install dependecies and build the compiler:
```bash
npm install
npm run build
```
Create a source file. For example, create the file `test.func` with the following contents:
```
func double(x) = 2 * x

func square(x) = x * x

squareAndDouble = double . square

eighteen = squareAndDouble(3)
```
Compile the source file:
```bash
npm run compile test.func
```
The compiler will write the output to `test.js`.

### Running tests
Build the project and run tests:
```bash
npm run build-and-test
```
Run the tests without building the project:
```bash
npm run test
```

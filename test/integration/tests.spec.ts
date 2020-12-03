import assert from 'assert';
import { inferExpression, inferModule, inferStatement } from '../../src/typeChecker/inference';
import {
    BOOL_TYPE,
    Context, curriedFunctionScheme,
    functionType,
    NUMBER_TYPE,
    typeVar,
    unboundScheme,
} from '../../src/typeChecker/types';
import { parseExpression, parseModule, parseStatement } from '../../src/parser';
import { builtins } from '../../src/typeChecker/builtins';

describe('srouce type inference', function () {
    describe('expression inference', function () {
        it('should correctly infer the type of an integer literal', function () {
            const type = inferExpressionSource('6');
            assert.deepStrictEqual(type, NUMBER_TYPE);
        });
        it('should correctly infer the type of an integer sum', function () {
            const type = inferExpressionSource('6+4+2');
            assert.deepStrictEqual(type, NUMBER_TYPE);
        });
        it('should correctly infer the type of a comparison', function () {
            const type = inferExpressionSource('6<4');
            assert.deepStrictEqual(type, BOOL_TYPE);
        });
        it('should correctly infer the type of an integer sum and the variable used inside', function () {
            const context = {
                a: unboundScheme(typeVar('u1')),
                b: unboundScheme(typeVar('u2')),
                c: unboundScheme(typeVar('u3')),
            };
            const type = inferExpressionSource('c+a+b', context);
            assert.deepStrictEqual(type, NUMBER_TYPE);
        });
    });
    describe('statement inference', function () {
        it('should correctly infer a type of a variable', function () {
            const context = inferStatementSource('luka = const(4)');
            assert.deepStrictEqual(context['luka'], curriedFunctionScheme(typeVar('u1'), NUMBER_TYPE));
        });
        it('should correctly infer a type of a function', function () {
            const context = inferStatementSource('func square(x) = x * x');
            assert.deepStrictEqual(context['square'], curriedFunctionScheme(NUMBER_TYPE, NUMBER_TYPE));
        });
    });
    describe('module inference', function () {
        it('should correctly infer the types in a small module', function () {
            const source = `
func square(x) = x * x
func larger(x, y) = x if x > y else y
func squareLarger(x, y) = square(x if x > y else y)

input1 = 4
input2 = 5
result = squareLarger(input1, input2)

func applyNTimes(f, x, times) = f(x) if times == 1 else f(f(x))
result2 = applyNTimes(square, 4, 2)

const2 = const(2)

        	`;
            const context = inferModuleSource(source);
            assert.deepStrictEqual(context['square'], curriedFunctionScheme(NUMBER_TYPE, NUMBER_TYPE));
            assert.deepStrictEqual(context['larger'], curriedFunctionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE));
            assert.deepStrictEqual(context['squareLarger'], curriedFunctionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE));
            assert.deepStrictEqual(context['input1'], unboundScheme(NUMBER_TYPE));
            assert.deepStrictEqual(context['input2'], unboundScheme(NUMBER_TYPE));
            assert.deepStrictEqual(context['result'], unboundScheme(NUMBER_TYPE));
            const e = curriedFunctionScheme(
                functionType(typeVar('u1'), typeVar('u1')),
                typeVar('u1'),
                NUMBER_TYPE,
                typeVar('u1'),
            );
            assert.deepStrictEqual(context['applyNTimes'], e);
            assert.deepStrictEqual(context['const2'], curriedFunctionScheme(typeVar('u1'), NUMBER_TYPE));
        });
    });
});

function inferExpressionSource(source: string, context: Context = {}) {
    const ast = parseExpression(source);
    return inferExpression(ast, { ...builtins, ...context });
}

function inferStatementSource(source: string, context: Context = {}): Context {
    return inferStatement({ ...builtins, ...context }, parseStatement(source));
}

function inferModuleSource(source: string): Context {
    return inferModule(parseModule(source));
}

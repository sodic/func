import assert from 'assert';
import { inferExpression } from '../../src/checker/inference/expressions';
import { parseExpression, parseModule, parseStatement } from '../../src/parser';
import { builtins } from '../../src/checker/inference/builtins';
import { inferStatement } from '../../src/checker/inference/statements';
import { BOOL_TYPE, NUMBER_TYPE } from '../../src/checker/types/common';
import { functionType, typeVar, unboundScheme } from '../../src/checker/types/builders';
import { inferModule } from '../../src/checker/inference/module';
import { functionScheme } from '../../src/checker/inference/helpers';
import { Context } from '../../src/checker/types/context';
import { BuiltinName } from '../../src/builtins';

describe('source type inference', function () {
    describe('expression inference', function () {
        it('should correctly infer the type of an integer literal', function () {
            const { type } = inferExpressionSource('6');
            assert.deepStrictEqual(type, NUMBER_TYPE);
        });
        it('should correctly infer the type of an integer sum', function () {
            const { type } = inferExpressionSource('6+4+2');
            assert.deepStrictEqual(type, NUMBER_TYPE);
        });
        it('should correctly infer the type of a comparison', function () {
            const { type } = inferExpressionSource('6<4');
            assert.deepStrictEqual(type, BOOL_TYPE);
        });
        it('should correctly infer the type of an integer sum and the variable used inside', function () {
            const context = {
                a: unboundScheme(typeVar('u1')),
                b: unboundScheme(typeVar('u2')),
                c: unboundScheme(typeVar('u3')),
            };
            const { type } = inferExpressionSource('c+a+b', context);
            assert.deepStrictEqual(type, NUMBER_TYPE);
        });
    });
    describe('statement inference', function () {
        it('should correctly infer a type of a variable', function () {
            const context = inferStatementSource(`luka = ${BuiltinName.Constant}(4)`);
            assert.deepStrictEqual(context['luka'], functionScheme(typeVar('u1'), NUMBER_TYPE));
        });
        it('should correctly infer a type of a function', function () {
            const context = inferStatementSource('func square(x) = x * x');
            assert.deepStrictEqual(context['square'], functionScheme(NUMBER_TYPE, NUMBER_TYPE));
        });
        it('should correctly infer a type of a simple recursive function', function () {
            const context = inferStatementSource('func f(x) = f(x)');
            assert.deepStrictEqual(context['f'], functionScheme(typeVar('u1'), typeVar('u2')));

        });
        it('should correctly infer a type of a factorial function', function () {
            const context = inferStatementSource('func fact(n) = 1 if n == 0 else fact(n - 1)');
            assert.deepStrictEqual(context['fact'], functionScheme(NUMBER_TYPE, NUMBER_TYPE));
        });
        it('should correctly infer a type of a more complex recursive function', function () {
            const context = inferStatementSource('func applyNTimes(f, x, n) = x if n < 0 else f(applyNTimes(f, x, n - 1))');
            const expected = functionScheme(
                functionType(typeVar('u1'), typeVar('u1')),
                typeVar('u1'),
                NUMBER_TYPE,
                typeVar('u1'),
            );
            assert.deepStrictEqual(context['applyNTimes'], expected);
        });
        it('should correctly detect a type mismatch in recursive functions 1', function () {
            assert.throws(() => inferStatementSource('func f(x) = f(x, 1)'), Error);
        });
        it('should correctly detect a type mismatch in recursive functions 2', function () {
            assert.throws(() => inferStatementSource('func f(x) = f'));
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

func applyNTimes(f, x, n) = x if n < 0 else f(applyNTimes(f, x, n - 1))
result2 = applyNTimes(square, 4, 2)

const2 = ${BuiltinName.Constant}(2)
            `;
            const context = inferModuleSource(source);
            assert.deepStrictEqual(context['square'], functionScheme(NUMBER_TYPE, NUMBER_TYPE));
            assert.deepStrictEqual(context['larger'], functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE));
            assert.deepStrictEqual(context['squareLarger'], functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE));
            assert.deepStrictEqual(context['input1'], unboundScheme(NUMBER_TYPE));
            assert.deepStrictEqual(context['input2'], unboundScheme(NUMBER_TYPE));
            assert.deepStrictEqual(context['result'], unboundScheme(NUMBER_TYPE));
            const e = functionScheme(
                functionType(typeVar('u1'), typeVar('u1')),
                typeVar('u1'),
                NUMBER_TYPE,
                typeVar('u1'),
            );
            assert.deepStrictEqual(context['applyNTimes'], e);
            assert.deepStrictEqual(context['const2'], functionScheme(typeVar('u1'), NUMBER_TYPE));
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

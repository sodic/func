import assert from 'assert';
import {
    Builtin,
    makeAssignment,
    makeBinOpCall,
    makeCall,
    makeIdentifierReference,
    makeLet,
    makeNumber,
} from '../../../src/ast';
import { BuiltinName } from '../../../src/builtins';
import { transpileExpression } from '../../../src/generator/transpile/expressions';

describe('transpile', function () {
    describe('#transpileExpression', function () {
        it('should correctly transpile a sum', function () {
            const expression = makeBinOpCall(
                makeIdentifierReference(BuiltinName.Add),
                [
                    makeBinOpCall(
                        makeIdentifierReference(BuiltinName.Subtract),
                        [
                            makeNumber(1),
                            makeNumber(2),
                        ],
                    ),
                    makeNumber(3),
                ],
            );
            const code = transpileExpression(expression);
            const expected = '1 - 2 + 3';
            assert.deepStrictEqual(code, expected);
        });
        it('should correctly transpile a complex arithmetic expression', function () {
            const expression = makeBinOpCall(
                Builtin.Add,
                [
                    makeBinOpCall(
                        Builtin.Subtract,
                        [
                            makeCall(
                                makeIdentifierReference('f'),
                                [
                                    makeBinOpCall(
                                        Builtin.GreaterEqualThan,
                                        [
                                            makeIdentifierReference('a'),
                                            makeNumber(10),
                                        ],
                                    ),
                                    makeIdentifierReference('b'),
                                ],
                            ),
                            makeNumber(2),
                        ],
                    ),
                    makeCall(
                        makeIdentifierReference('sum'),
                        [
                            makeNumber(1),
                            makeNumber(2),
                            makeIdentifierReference('result'),
                        ],
                    ),
                ],
            );
            const code  = transpileExpression(expression);
            const expected = 'f(a >= 10)(b) - 2 + sum(1)(2)(result)';
            assert.deepStrictEqual(code, expected);
        });
        it('should correctly transpile a let expression', function () {
            // let x = 6 in x * x
            const expression = makeLet(
                makeAssignment('x', makeNumber(6)),
                makeBinOpCall(
                    Builtin.Multiply,
                    [
                        makeIdentifierReference('x'),
                        makeIdentifierReference('x'),
                    ],
                ),
            );
            const code = transpileExpression(expression);
            const expected = 6 * 6;
            assert.deepStrictEqual(eval(code), expected);
        });
    });
});

import assert from 'assert';
import {
    makeAssignment,
    makeCall,
    makeIdentifierReference,
    makeLet,
    makeNumber,
} from '../../../src/ast/builders';
import { BuiltinName } from '../../../src/builtins';
import { translateExpression } from '../../../src/generator/translate';
import { Builtin } from '../../../src/ast/builtins';

describe('translate', function () {
    describe('#translateExpression', function () {
        it('should correctly translate a sum', function () {
            const expression = makeCall(
                makeIdentifierReference(BuiltinName.Add),
                [
                    makeCall(
                        makeIdentifierReference(BuiltinName.Subtract),
                        [
                            makeNumber(1),
                            makeNumber(2),
                        ],
                    ),
                    makeNumber(3),
                ],
            );
            const code = translateExpression(expression);
            const expected = '1 - 2 + 3';
            assert.deepStrictEqual(code, expected);
        });
        it('should correctly translate a complex arithmetic expression', function () {
            const expression = makeCall(
                Builtin.Add,
                [
                    makeCall(
                        Builtin.Subtract,
                        [
                            makeCall(
                                makeIdentifierReference('f'),
                                [
                                    makeCall(
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
            const code  = translateExpression(expression);
            const expected = 'f(a >= 10)(b) - 2 + sum(1)(2)(result)';
            assert.deepStrictEqual(code, expected);
        });
        it('should correctly translate a let expression', function () {
            // let x = 6 in x * x
            const expression = makeLet(
                makeAssignment('x', makeNumber(6)),
                makeCall(Builtin.Multiply, [
                    makeIdentifierReference('x'),
                    makeIdentifierReference('x'),
                ],
                ),
            );
            const code = translateExpression(expression);
            const expected = 6 * 6;
            assert.deepStrictEqual(eval(code), expected);
        });
    });
});
import assert from 'assert';
import {
    Builtin,
    makeApplication,
    makeAssignment,
    makeBoolean,
    makeCall,
    makeCharacter,
    makeIdentifierReference,
    makeLet,
    makeNumber,
    makeString,
} from '../../../src/ast';
import { BuiltinName } from '../../../src/builtins';
import { transpileExpression } from '../../../src/codeGeneration/transpile/expressions';

describe('transpile', function () {
    describe('#transpileExpression', function () {
        it('should correctly transpile a sum', function () {
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
            const code = transpileExpression(expression);
            const expected = '1 - 2 + 3';
            assert.deepStrictEqual(code, expected);
        });
        it('should correctly transpile a complex arithmetic expression', function () {
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
            const code  = transpileExpression(expression);
            const expected = 'f(a >= 10)(b) - 2 + sum(1)(2)(result)';
            assert.deepStrictEqual(code, expected);
        });
        it('should correctly transpile a let expression', function () {
            // let x = 6 in x * x
            const expression = makeLet(
                makeAssignment('x', makeNumber(6)),
                makeCall(
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
        it('should correctly transpile a logical expression', function () {
            const expression = makeCall(
                Builtin.Or,
                [
                    makeBoolean(true),
                    makeCall(
                        Builtin.And,
                        [
                            makeBoolean(false),
                            makeApplication(
                                Builtin.Not,
                                makeBoolean(false),
                            ),
                        ],
                    ),
                ],
            );
            const code = transpileExpression(expression);
            const expected = true;
            assert.deepStrictEqual(eval(code), expected);
        });
        it('should correctly transpile a character literal containing a single quote', function () {
            const expression = makeCharacter('\'');
            const code = transpileExpression(expression);
            assert.deepStrictEqual(code, '"\'"');
        });
        it('should correctly transpile a character literal containing a double quote', function () {
            const expression = makeCharacter('"');
            const code = transpileExpression(expression);
            assert.deepStrictEqual(code, '"\\""');
        });
        it('should correctly transpile a string literal containing single quotes', function () {
            const expression = makeString(['a', '\'', 'b']);
            const code = transpileExpression(expression);
            const expected = '["a", "\'", "b"]';
            assert.deepStrictEqual(code, expected);
        });
        it('should correctly transpile a string literal containing double quotes', function () {
            const expression = makeString(['a', '"', 'b']);
            const code = transpileExpression(expression);
            const expected = '["a", "\\"", "b"]';
            assert.deepStrictEqual(code, expected);
        });
    });
});

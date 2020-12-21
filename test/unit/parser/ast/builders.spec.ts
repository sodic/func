import assert from 'assert';
import {
    Builtin,
    BinaryChainElement,
    buildBinaryExpressionChain,
    makeApplication,
    makeCall,
    makeIdentifierReference,
    makeNumber,
    PipelineElement,
    makeLambda,
    buildPipeline,
} from '../../../../src/ast';
import { BuiltinName } from '../../../../src/builtins';

describe('helpers', function () {
    describe('#buildBinaryExpressionChain', function () {
        it('should correctly build a binary expression chain when the operator is not used', function () {
            const result = buildBinaryExpressionChain(makeIdentifierReference('a'), []);
            assert.deepStrictEqual(result, makeIdentifierReference('a'));
        });
        it('should correctly build a binary expression chain when the operator is used once', function () {
            const head = makeIdentifierReference('a');
            const other: BinaryChainElement = [null, BuiltinName.Add, null, makeIdentifierReference('b')];
            const result = buildBinaryExpressionChain(head, [other]);
            const expected = makeCall(Builtin.Add, [head, other[3]]);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly build a chained binary expression', function () {
            const head = makeIdentifierReference('a');
            const tail: BinaryChainElement[] = [
                [null, BuiltinName.Multiply, null, makeIdentifierReference('b')],
                [null, BuiltinName.Modulus, null, makeIdentifierReference('c')],
                [null, BuiltinName.Divide, null, makeIdentifierReference('d')],
            ];
            const result = buildBinaryExpressionChain(head, tail);
            const expected = makeCall(
                makeIdentifierReference(tail[2][1]),
                [
                    makeCall(
                        makeIdentifierReference(tail[1][1]),
                        [
                            makeCall(
                                makeIdentifierReference(tail[0][1]),
                                [
                                    head,
                                    tail[0][3],
                                ],
                            ),
                            tail[1][3],
                        ],
                    ),
                    tail[2][3],
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
    });
    describe('#buildPipeline', function () {
        it('should correctly build a pipeline', function () {
            const head = makeIdentifierReference('a');
            const tail: PipelineElement[] = [
                [null, '|>', null, makeIdentifierReference('f')],
                [null, '|>', null, makeLambda('x', makeCall(Builtin.Add, [makeIdentifierReference('x'), makeNumber(1)]))],
                [null, '|>', null, Builtin.Multiply],
            ];
            const result = buildPipeline(head, tail);
            const expected = makeCall(
                Builtin.Multiply,
                [
                    makeCall(
                        makeLambda(
                            'x',
                            makeCall(
                                Builtin.Add,
                                [
                                    makeIdentifierReference('x'),
                                    makeNumber(1),
                                ],
                            ),
                        ),
                        [
                            makeCall(
                                makeIdentifierReference('f'),
                                [
                                    makeIdentifierReference('a'),
                                ],
                            ),
                        ],
                    ),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
    });
    describe('#makeCall', function () {
        it('should correctly build a unary function call', function () {
            const result = makeCall(makeIdentifierReference('a'), [makeNumber(1)]);
            const expected = makeApplication(makeIdentifierReference('a'), makeNumber(1));
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly build a function call chain calling n-ary functions', function () {
            const result = makeCall(makeIdentifierReference('a'), [makeNumber(1), makeNumber(2)]);
            const expected = makeApplication(
                makeApplication(
                    makeIdentifierReference('a'),
                    makeNumber(1),
                ),
                makeNumber(2),
            );
            assert.deepStrictEqual(result, expected);
        });
    });
});

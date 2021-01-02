import assert from 'assert';
import {
    bindableBinaryOperators,
    buildBinaryExpressionChain,
    buildComposition,
    buildPipeline,
    Builtin,
    ChainElement,
    Expression,
    ExpressionKind,
    Literal,
    LiteralKind,
    makeApplication,
    makeArray,
    makeCall,
    makeIdentifierReference,
    makeLambda,
    makeNumber,
    makeOperatorBindingBare,
    makeOperatorBindingLeft,
    makeOperatorBindingRight,
    COMPOSITION_PARAM,
    OPERATOR_BINDING_PARAM,
    OPERATOR_BINDING_PARAM_1,
    OPERATOR_BINDING_PARAM_2,
} from '../../../../src/ast';

describe('helpers', function () {
    describe('#buildBinaryExpressionChain', function () {
        it('should correctly build a binary expression chain when the operator is not used', function () {
            const result = buildBinaryExpressionChain(makeIdentifierReference('a'), []);
            assert.deepStrictEqual(result, makeIdentifierReference('a'));
        });
        it('should correctly build a binary expression chain when the operator is used once', function () {
            const head = makeIdentifierReference('a');
            const other: ChainElement = [null, Builtin.Add, null, makeIdentifierReference('b')];
            const result = buildBinaryExpressionChain(head, [other]);
            const expected = makeCall(Builtin.Add, [head, other[3]]);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly build a chained binary expression', function () {
            const head = makeIdentifierReference('a');
            const tail: ChainElement[] = [
                [null, Builtin.Multiply, null, makeIdentifierReference('b')],
                [null, Builtin.Modulus, null, makeIdentifierReference('c')],
                [null, Builtin.Divide, null, makeIdentifierReference('d')],
            ];
            const result = buildBinaryExpressionChain(head, tail);
            const expected = makeCall(
                tail[2][1],
                [
                    makeCall(
                        tail[1][1],
                        [
                            makeCall(
                                tail[0][1],
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
            const tail: ChainElement[] = [
                [null, Builtin.Pipe, null, makeIdentifierReference('f')],
                [null, Builtin.Pipe, null, makeLambda('x', makeCall(Builtin.Add, [makeIdentifierReference('x'), makeNumber(1)]))],
                [null, Builtin.Pipe, null, Builtin.Multiply],
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
    describe('#buildComposition', function () {
        it('should correctly build a composition', function () {
            const head = makeIdentifierReference('f');
            const tail: ChainElement[] = [
                [null, Builtin.Compose, null, makeIdentifierReference('g')],
                [null, Builtin.Compose, null, Builtin.ToString],
                [null, Builtin.Compose, null, Builtin.Multiply],
            ];
            const result = buildComposition(head, tail);
            const expected = makeLambda(
                COMPOSITION_PARAM,
                makeApplication(
                    makeIdentifierReference('f'),
                    makeApplication(
                        makeIdentifierReference('g'),
                        makeApplication(
                            Builtin.ToString,
                            makeApplication(
                                Builtin.Multiply,
                                makeIdentifierReference(COMPOSITION_PARAM),
                            ),
                        ),
                    ),
                ),
            );
            assert.deepStrictEqual(result, expected);
        });
    });
    describe('#makeOperatorBindingBare', function () {
        it('should correctly bind the left argument to a binary operator', function () {
            bindableBinaryOperators.forEach(operator => {
                const result = makeOperatorBindingBare(operator);
                const expected =
                    makeLambda(
                        OPERATOR_BINDING_PARAM_1,
                        makeLambda(
                            OPERATOR_BINDING_PARAM_2,
                            makeCall(
                                operator,
                                [
                                    makeIdentifierReference(OPERATOR_BINDING_PARAM_1),
                                    makeIdentifierReference(OPERATOR_BINDING_PARAM_2),
                                ],
                            ),
                        ),
                    );
                assert.deepStrictEqual(result, expected);
            });
        });
    });
    describe('#makeOperatorBindingRight', function () {
        it('should correctly bind the left argument to a binary operator', function () {
            bindableBinaryOperators.forEach(operator => {
                const result = makeOperatorBindingLeft(operator, makeNumber(1));
                const expected =
                    makeLambda(
                        OPERATOR_BINDING_PARAM,
                        makeCall(
                            operator,
                            [
                                makeNumber(1),
                                makeIdentifierReference(OPERATOR_BINDING_PARAM),
                            ],
                        ),
                    );
                assert.deepStrictEqual(result, expected);
            });
        });
    });
    describe('#makeOperatorBindingRight', function () {
        it('should correctly bind the right argument to a binary operator', function () {
            bindableBinaryOperators.forEach(operator => {
                const result = makeOperatorBindingRight(operator, makeNumber(1));
                const expected = makeLambda(
                    OPERATOR_BINDING_PARAM,
                    makeCall(
                        operator,
                        [
                            makeIdentifierReference(OPERATOR_BINDING_PARAM),
                            makeNumber(1),
                        ],
                    ),
                );
                assert.deepStrictEqual(result, expected);
            });
        });
    });
    describe('#makearray', function () {
        it('should correctly build a regular array literal', function () {
            const result = makeArray(
                makeNumber(1),
                makeNumber(2),
                makeNumber(3),
                makeCall(Builtin.Add, [makeNumber(1), makeNumber(2)]),
            );
            const expected: Literal = {
                kind: ExpressionKind.Literal,
                value: {
                    kind: LiteralKind.Array,
                    contents: [
                        makeNumber(1),
                        makeNumber(2),
                        makeNumber(3),
                        makeCall(Builtin.Add, [makeNumber(1), makeNumber(2)]),
                    ],
                },
            };
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly build an array literal with spreads', function () {
            const result = makeArray(
                makeNumber(1),
                makeNumber(2),
                makeNumber(3),
                ['*', makeArray(makeNumber(-1), makeNumber(-2))],
                makeNumber(4),
                ['*', makeApplication(makeIdentifierReference('f'), makeNumber(2))],
                makeNumber(5),
                makeNumber(6),
            );
            const expected: Expression = makeCall(
                Builtin.Concat,
                [
                    makeArray(
                        makeNumber(1),
                        makeNumber(2),
                        makeNumber(3),
                    ),
                    makeCall(
                        Builtin.Concat,
                        [
                            makeArray(makeNumber(-1), makeNumber(-2)),
                            makeCall(
                                Builtin.Concat,
                                [
                                    makeArray(makeNumber(4)),
                                    makeCall(
                                        Builtin.Concat,
                                        [
                                            makeApplication(makeIdentifierReference('f'), makeNumber(2)),
                                            makeArray(
                                                makeNumber(5),
                                                makeNumber(6),
                                            ),
                                        ],
                                    ),
                                ],
                            ),
                        ],
                    ),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
    });
});

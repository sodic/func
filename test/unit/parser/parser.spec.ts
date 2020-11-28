import assert from 'assert';
import { parse } from '../../../src/parser';
import { makeCall, makeNumber } from '../../../src/parser/ast/helpers';

describe('parser', function () {
    describe('#parse', function () {
        it('should correctly parse simple literal addition', function () {
            const result= parse('1 + 2');
            const expected = makeCall('+', [makeNumber(1), makeNumber(2)]);
            assert.deepStrictEqual(result, expected);
        });
        it('should parse longer additive expression as left-associative', function () {
            const result= parse('1 + 2 - 3 + 4 - 5');
            const expected = makeCall(
                '-',
                [makeCall(
                    '+',
                    [
                        makeCall(
                            '-',
                            [
                                makeCall(
                                    '+',
                                    [
                                        makeNumber(1),
                                        makeNumber(2),
                                    ],
                                ),
                                makeNumber(3),
                            ],
                        ),
                        makeNumber(4),
                    ],
                ),
                makeNumber(5),
                ]);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse simple literal multiplication', function () {
            const result= parse('3 * 4');
            const expected = makeCall('*', [makeNumber(3), makeNumber(4)]);
            assert.deepStrictEqual(result, expected);
        });
        it('should parse longer multiplicative expression as left-associative', function () {
            const result= parse('1 * 2 / 3 % 4 * 5');
            const expected = makeCall(
                '*',
                [makeCall(
                    '%',
                    [
                        makeCall(
                            '/',
                            [
                                makeCall(
                                    '*',
                                    [
                                        makeNumber(1),
                                        makeNumber(2),
                                    ],
                                ),
                                makeNumber(3),
                            ],
                        ),
                        makeNumber(4),
                    ],
                ),
                makeNumber(5),
                ]);
            assert.deepStrictEqual(result, expected);
        });
        it('should parse complex arithmetic expressions with correct operator precedence', function () {
            const result= parse('1 + 2 * 3 - 4 / 5');
            const expected = makeCall(
                '-',
                [
                    makeCall(
                        '+',
                        [
                            makeNumber(1),
                            makeCall(
                                '*',
                                [
                                    makeNumber(2),
                                    makeNumber(3),
                                ],
                            ),
                        ],
                    ),
                    makeCall(
                        '/',
                        [
                            makeNumber(4),
                            makeNumber(5),
                        ],
                    ),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should parse arithmetic expressions containing parentheses with correct precedence', function () {
            const result= parse('(1 + 2) * ((3 - 4)/ 5)');
            const expected = makeCall(
                '*',
                [
                    makeCall(
                        '+',
                        [
                            makeNumber(1),
                            makeNumber(2),
                        ],
                    ),
                    makeCall(
                        '/',
                        [
                            makeCall(
                                '-',
                                [
                                    makeNumber(3),
                                    makeNumber(4),
                                ],
                            ),
                            makeNumber(5),
                        ],
                    ),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
    });
});

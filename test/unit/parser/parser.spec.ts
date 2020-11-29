import assert from 'assert';
import { parse } from '../../../src/parser';
import {
    makeAssignment,
    makeCall,
    makeFunctionDefinition,
    makeIdentifierReference,
    makeNumber,
} from '../../../src/parser/ast/helpers';

describe('parser', function () {
    describe('#parse', function () {
        it('should correctly parse simple literal addition', function () {
            const result= parse('1+2');
            const expected = makeCall(makeIdentifierReference('+'), [makeNumber(1), makeNumber(2)]);
            assert.deepStrictEqual(result, expected);
        });
        it('should parse longer literal additive expression as left-associative', function () {
            const result= parse('1+2-3+4-5');
            const expected = makeCall(
                makeIdentifierReference('-'),
                [makeCall(
                    makeIdentifierReference('+'),
                    [
                        makeCall(
                            makeIdentifierReference('-'),
                            [
                                makeCall(
                                    makeIdentifierReference('+'),
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
            const result= parse('3*4');
            const expected = makeCall(makeIdentifierReference('*'), [makeNumber(3), makeNumber(4)]);
            assert.deepStrictEqual(result, expected);
        });
        it('should parse longer literal multiplicative expression as left-associative', function () {
            const result= parse('1*2/3%4*5');
            const expected = makeCall(
                makeIdentifierReference('*'),
                [makeCall(
                    makeIdentifierReference('%'),
                    [
                        makeCall(
                            makeIdentifierReference('/'),
                            [
                                makeCall(
                                    makeIdentifierReference('*'),
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
        it('should parse a complex literal arithmetic expression with correct operator precedence', function () {
            const result= parse('1+2*3-4/5');
            const expected = makeCall(
                makeIdentifierReference('-'),
                [
                    makeCall(
                        makeIdentifierReference('+'),
                        [
                            makeNumber(1),
                            makeCall(
                                makeIdentifierReference('*'),
                                [
                                    makeNumber(2),
                                    makeNumber(3),
                                ],
                            ),
                        ],
                    ),
                    makeCall(
                        makeIdentifierReference('/'),
                        [
                            makeNumber(4),
                            makeNumber(5),
                        ],
                    ),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should parse a literal arithmetic expression containing parentheses with correct operator precedence', function () {
            const result= parse('(1+2)*((3-4)/5)');
            const expected = makeCall(
                makeIdentifierReference('*'),
                [
                    makeCall(
                        makeIdentifierReference('+'),
                        [
                            makeNumber(1),
                            makeNumber(2),
                        ],
                    ),
                    makeCall(
                        makeIdentifierReference('/'),
                        [
                            makeCall(
                                makeIdentifierReference('-'),
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
        it('should correctly parse a literal arithmetic expression that even casio calculators can\'t handle', function () {
            const result = parse('9/3*(1+2)');
            const expected = makeCall(
                makeIdentifierReference('*'),
                [
                    makeCall(
                        makeIdentifierReference('/'),
                        [
                            makeNumber(9),
                            makeNumber(3),
                        ],
                    ),
                    makeCall(
                        makeIdentifierReference('+'),
                        [
                            makeNumber(1),
                            makeNumber(2),
                        ],
                    ),
                ],
            );
            assert.deepStrictEqual(result, expected);

        });
        it('should correctly parse a complex arithmetic expression containing identifier references', function () {
            const result= parse('1*x/3%ligma*mate');
            const expected = makeCall(
                makeIdentifierReference('*'),
                [makeCall(
                    makeIdentifierReference('%'),
                    [
                        makeCall(
                            makeIdentifierReference('/'),
                            [
                                makeCall(
                                    makeIdentifierReference('*'),
                                    [
                                        makeNumber(1),
                                        makeIdentifierReference('x'),
                                    ],
                                ),
                                makeNumber(3),
                            ],
                        ),
                        makeIdentifierReference('ligma'),
                    ],
                ),
                makeIdentifierReference('mate'),
                ]);
            assert.deepStrictEqual(result, expected);

        });
        it('should be whitespace insensitive when parsing arithmetic expressions', function () {
            const result1 = parse('  1 +   x      /3 - 4%y    *6 ');
            const result2 = parse('1+x/3-4%y*6');
            assert.deepStrictEqual(result1, result2);

        });
        it('should parse a simple variable definition correctly', function () {
            const result = parse('some123Var=1');
            const expected = makeAssignment('some123Var', makeNumber(1));
            assert.deepStrictEqual(result, expected);
        });
        it('should parse a more variable definition initialized with a complex expression correctly', function () {
            const result = parse('someVar = 3*(4+x)');
            const expected = makeAssignment('someVar', parse('3 * (4 + x)'));
            assert.deepStrictEqual(result, expected);
        });
        it('should be whitespace insensitive in assignment statements', function () {
            const result1 = parse('x1    =   9* (4 +3     ) %4  +   (1-    2) ');
            const result2 = parse('x1=9*(4+3)%4+(1-2)');
            assert.deepStrictEqual(result1, result2);
        });
        it('should correctly parse a unary function definition', function () {
            const result = parse('func square(x)=x*x');
            const expected = makeFunctionDefinition('square', ['x'], parse('x * x'));
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse an binary function definition', function () {
            const result = parse('func area(x,y)=x*y');
            const expected = makeFunctionDefinition(
                'area',
                ['x', 'y'],
                parse('x*y'),
            );
            assert.deepStrictEqual(result, expected);

        });
        it('should be whitespace insensitive when parsing function definitions', function () {
            const result1 = parse('func some12Func       (   x      ,   y  )    =   x   *  y    ');
            const result2 = parse('func some12Func(x,y)=x*y');
            assert.deepStrictEqual(result1, result2);
        });
        it('should correctly parse a unary function call', function () {
            const result = parse('square(x)');
            const expected = makeCall(makeIdentifierReference('square'), [makeIdentifierReference('x')]);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a binary function call', function () {
            const result = parse('add(x,y)');
            const expected = makeCall(
                makeIdentifierReference('add'),
                [
                    makeIdentifierReference('x'),
                    makeIdentifierReference('y'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a call chain', function () {
            const result = parse('f(x)(3)(2+1)') ;
            const expected = makeCall(
                makeCall(
                    makeCall(
                        parse('f'),
                        [parse('x')],
                    ),
                    [parse('3')],
                ),
                [parse('2 + 1')],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should be able to work with function calls within arithmetic expressions', function () {
            const result = parse('1-(a+double(5))+square(3)(4)*area(a,5)');
            const expected = makeCall(
                makeIdentifierReference('+'),
                [
                    makeCall(
                        makeIdentifierReference('-'),
                        [
                            parse('1'),
                            makeCall(
                                makeIdentifierReference('+'),
                                [
                                    parse('a'),
                                    parse('double(5)'),
                                ],
                            ),
                        ],
                    ),
                    makeCall(
                        makeIdentifierReference('*'),
                        [
                            parse('square(3)(4)'),
                            parse('area(a, 5)'),
                        ],
                    ),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should be whitespace insensitive when parsing function calls in expressions', function () {
            const result1 = parse('x    + a (  1,    2 )-3  + 5*f   (1,2) (4)   (1)-1   ');
            const result2 = parse('x+a(1,2)-3+5*f(1,2)(4)(1)-1');
            assert.deepStrictEqual(result1, result2);
        });
    });
});

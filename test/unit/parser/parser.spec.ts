import assert from 'assert';
import { parseExpression, parseModule, parseStatement } from '../../../src/parser';
import {
    makeAssignment,
    makeCall, makeConditional,
    makeFunctionDefinition,
    makeIdentifierReference, makeModule,
    makeNumber,
} from '../../../src/parser/ast/helpers';

describe('parser', function () {
    describe('#parseExpression', function () {
        it('should correctly parse simple literal addition', function () {
            const result= parseExpression('1+2');
            const expected = makeCall(makeIdentifierReference('+'), [makeNumber(1), makeNumber(2)]);
            assert.deepStrictEqual(result, expected);
        });
        it('should parse longer literal additive expression as left-associative', function () {
            const result= parseExpression('1+2-3+4-5');
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
            const result= parseExpression('3*4');
            const expected = makeCall(makeIdentifierReference('*'), [makeNumber(3), makeNumber(4)]);
            assert.deepStrictEqual(result, expected);
        });
        it('should parse longer literal multiplicative expression as left-associative', function () {
            const result= parseExpression('1*2/3%4*5');
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
            const result= parseExpression('1+2*3-4/5');
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
            const result= parseExpression('(1+2)*((3-4)/5)');
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
            const result = parseExpression('9/3*(1+2)');
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
            const result= parseExpression('1*x/3%ligma*mate');
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
            const result1 = parseExpression('  1 +   x      /3 - 4%y    *6 ');
            const result2 = parseExpression('1+x/3-4%y*6');
            assert.deepStrictEqual(result1, result2);

        });
        it('should correctly parse a unary function call', function () {
            const result = parseExpression('square(x)');
            const expected = makeCall(makeIdentifierReference('square'), [makeIdentifierReference('x')]);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a binary function call', function () {
            const result = parseExpression('add(x,y)');
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
            const result = parseExpression('f(x)(3)(2+1)') ;
            const expected = makeCall(
                makeCall(
                    makeCall(
                        parseExpression('f'),
                        [parseExpression('x')],
                    ),
                    [parseExpression('3')],
                ),
                [parseExpression('2 + 1')],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should be able to work with function calls within arithmetic expressions', function () {
            const result = parseExpression('1-(a+double(5))+square(3)(4)*area(a,5)');
            const expected = makeCall(
                makeIdentifierReference('+'),
                [
                    makeCall(
                        makeIdentifierReference('-'),
                        [
                            parseExpression('1'),
                            makeCall(
                                makeIdentifierReference('+'),
                                [
                                    parseExpression('a'),
                                    parseExpression('double(5)'),
                                ],
                            ),
                        ],
                    ),
                    makeCall(
                        makeIdentifierReference('*'),
                        [
                            parseExpression('square(3)(4)'),
                            parseExpression('area(a, 5)'),
                        ],
                    ),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should be whitespace insensitive when parsing function calls in expressions', function () {
            const result1 = parseExpression('x    + a (  1,    2 )-3  + 5*f   (1,2) (4)   (1)-1   ');
            const result2 = parseExpression('x+a(1,2)-3+5*f(1,2)(4)(1)-1');
            assert.deepStrictEqual(result1, result2);
        });
        it('should correctly parse an equality check', function () {
            const result1 = parseExpression('a+1==f(5)+3');
            const expected = makeCall(
                makeIdentifierReference('=='),
                [
                    parseExpression('a+1'),
                    parseExpression('f(5)+3'),
                ],
            );
            assert.deepStrictEqual(result1, expected);
        });
        it('should correctly parse an inequality check', function () {
            const result1 = parseExpression('a+1!=f(5)+3');
            const expected = makeCall(
                makeIdentifierReference('!='),
                [
                    parseExpression('a+1'),
                    parseExpression('f(5)+3'),
                ],
            );
            assert.deepStrictEqual(result1, expected);
        });
        it('should correctly parse a less-then check', function () {
            const result = parseExpression('a-1<5');
            const expected = makeCall(
                makeIdentifierReference('<'),
                [
                    parseExpression('a-1'),
                    parseExpression('5'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a less-then-or-equal check', function () {
            const result = parseExpression('a<=5+2');
            const expected = makeCall(
                makeIdentifierReference('<='),
                [
                    parseExpression('a'),
                    parseExpression('5+2'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a greater-then check', function () {
            const result = parseExpression('a>5-1');
            const expected = makeCall(
                makeIdentifierReference('>'),
                [
                    parseExpression('a'),
                    parseExpression('5-1'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a greater-then-or-equal check', function () {
            const result = parseExpression('a>=5');
            const expected = makeCall(
                makeIdentifierReference('>='),
                [
                    parseExpression('a'),
                    parseExpression('5'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a logical conjunction', function () {
            const result = parseExpression('a==1 and b<3');
            const expected = makeCall(
                makeIdentifierReference('and'),
                [
                    parseExpression('a==1'),
                    parseExpression('b<3'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a longer logical conjunction', function () {
            const result = parseExpression('a==1 and b<3 and f(5) and g(4+3)-1');
            const expected = makeCall(
                makeIdentifierReference('and'),
                [
                    makeCall(
                        makeIdentifierReference('and'),
                        [
                            makeCall(
                                makeIdentifierReference('and'),
                                [
                                    parseExpression('a==1'),
                                    parseExpression('b<3'),
                                ],
                            ),
                            parseExpression('f(5)'),
                        ],
                    ),
                    parseExpression('g(4+3)-1'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a simple logical disjunction', function () {
            const result = parseExpression('a==1 and 3*2==6 or b+3==1 and 4==5');
            const expected = makeCall(
                makeIdentifierReference('or'),
                [
                    parseExpression('a==1 and 3*2==6'),
                    parseExpression('b+3==1 and 4==5'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a longer logical disjunction', function () {
            const result = parseExpression('(a==1 or 3) and 3*2==6 or b+3==1 and 4==5 and 4*2==1');
            const expected = makeCall(
                makeIdentifierReference('or'),
                [
                    makeCall(
                        makeIdentifierReference('and'),
                        [
                            makeCall(
                                makeIdentifierReference('or'),
                                [
                                    parseExpression('a==1'),
                                    parseExpression('3'),
                                ],
                            ),
                            parseExpression('3*2==6'),
                        ] ,
                    ),
                    parseExpression('b+3==1 and 4==5 and 4*2==1'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should be space insensitive when parsing long logical expressions', function() {
            const result1 = parseExpression('a==1 or 3 and 3*2==6 or b+3==1 and 4==5 and 4*2==1');
            const result2 = parseExpression('a    ==  1   or    3   and   3   *2  == 6     or   b +  3    ==  1  and  4 ==    5  and  4 * 2== 1  ');
            assert.deepStrictEqual(result1, result2);
        });
        it('should correctly parse a simple conditional expression', function () {
            const result = parseExpression('4+5 if a==5 or a==3 else f(5)-1');
            const expected = makeConditional(
                parseExpression('a==5 or a==3'),
                parseExpression('4+5'),
                parseExpression('f(5)-1'),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse multi-level conditional expressions', function () {
            const result = parseExpression('4+5 if a!=3 and a!=4 else 3 if a>=5 else a>5 if a<4 else f(a)-1');
            const expected = makeConditional(
                parseExpression('a!=3 and a!=4'),
                parseExpression('4+5'),
                makeConditional(
                    parseExpression('a>=5'),
                    parseExpression('3'),
                    parseExpression('a>5 if a<4 else f(a)-1'),
                ),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should be space insensitive when parsing conditional expressions', function () {
            const result1 = parseExpression('4    +   5 if a  !=  3   else    3    if a   >= 5    else  a   > 5');
            const result2 = parseExpression('4+5 if a!=3 else 3 if a>=5 else a>5');
            assert.deepStrictEqual(result1, result2);
        });
        it('should be able to work with if statements inside arithmetic expressions', function () {
            const result = parseExpression('1+(3 if a==3 else b) if c<4 else f(2 if b==1+2 and 4 else 4)');
            const expected = makeConditional(
                parseExpression('c<4'),
                makeCall(
                    makeIdentifierReference('+'),
                    [
                        parseExpression('1'),
                        parseExpression('3 if a==3 else b'),
                    ],
                ),
                makeCall(
                    makeIdentifierReference('f'),
                    [
                        makeConditional(
                            parseExpression('b==1+2 and 4'),
                            parseExpression('2'),
                            parseExpression('4'),
                        ),
                    ],
                ),
            );
            assert.deepStrictEqual(result, expected);
        });
    });
    describe('#parseStatement', function () {
        it('should parse a simple assignment correctly', function () {
            const result = parseStatement('some123Var=1');
            const expected = makeAssignment('some123Var', makeNumber(1));
            assert.deepStrictEqual(result, expected);
        });
        it('should parse a an assignment initialized with a complex expression correctly', function () {
            const result = parseStatement('someVar=3*(4+x)');
            const expected = makeAssignment('someVar', parseExpression('3*(4+x)'));
            assert.deepStrictEqual(result, expected);
        });
        it('should be whitespace insensitive in assignment statements', function () {
            const result1 = parseStatement('x1    =   9* (4 +3     ) %4  +   (1-    2) ');
            const result2 = parseStatement('x1=9*(4+3)%4+(1-2)');
            assert.deepStrictEqual(result1, result2);
        });
        it('should correctly parse a unary function definition', function () {
            const result = parseStatement('func square(x)=x*x');
            const expected = makeFunctionDefinition('square', ['x'], parseExpression('x * x'));
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse an binary function definition', function () {
            const result = parseStatement('func area(x,y)=x*y');
            const expected = makeFunctionDefinition(
                'area',
                ['x', 'y'],
                parseExpression('x*y'),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should be whitespace insensitive when parsing function definitions', function () {
            const result1 = parseStatement('func some12Func       (   x      ,   y  )    =   x   *  f(y + 3  )    ');
            const result2 = parseStatement('func some12Func(x,y)=x*f(y+3)');
            assert.deepStrictEqual(result1, result2);
        });
    });

    describe('#parseModule', function () {
        it('should correctly parse a one-line module', function () {
            const result = parseModule('a=3');
            const expected = makeModule([parseStatement('a=3')]);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a one-line module with a trailing newline', function () {
            const result = parseModule('a=3\n');
            const expected = makeModule([parseStatement('a=3')]);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a one-line module with a trailing and preceding newlines', function () {
            const result = parseModule('\n\na=3\n\n');
            const expected = makeModule([parseStatement('a=3')]);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a one-line module with trailing and preceding spaces', function () {
            const result = parseModule('\n   \na=3\n   \n   \n');
            const expected = makeModule([parseStatement('a=3')]);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a module', function() {
            const result = parseModule( `func square(x)=x*x
func add(x,y)=x+y
func larger(a,b)=a if a>=b else b
start=5
a=2
b=8 if a>2 and start==5 else 9
result=square(start) * 3 - larger(a,b)`);
            const expected = makeModule(
                [
                    parseStatement('func square(x)=x*x'),
                    parseStatement('func add(x,y)=x+y'),
                    parseStatement('func larger(a,b)=a if a>=b else b'),
                    parseStatement('start=5'),
                    parseStatement('a=2'),
                    parseStatement('b=8 if a>2 and start==5 else 9'),
                    parseStatement('result=square(start) * 3 - larger(a,b)'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should be case insensitive when parsing modules', function() {
            const result = parseModule( `        
              
func            square(x)=x                    *x
        
            
           
func        add(  x, y)    =x  +y    
func larger             ( a, b )=    a if    a>= b else b
        
        
start     =      5
    
    

a=2

b=  8 if  a>  2  and start ==   5 else  9

     
result       = square(    start  ) * 3 - larger(   a, b)        
     
        `);
            const expected = makeModule(
                [
                    parseStatement('func square(x)=x*x'),
                    parseStatement('func add(x,y)=x+y'),
                    parseStatement('func larger(a,b)=a if a>=b else b'),
                    parseStatement('start=5'),
                    parseStatement('a=2'),
                    parseStatement('b=8 if a>2 and start==5 else 9'),
                    parseStatement('result=square(start) * 3 - larger(a,b)'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse an empty module', function () {
            const result = parseModule('            \n   \n \n\n');
            assert.deepStrictEqual(result, makeModule([]));
        });
    });
});

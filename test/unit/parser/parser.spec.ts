import assert from 'assert';
import { parseExpression, parseModule, parseStatement } from '../../../src/parser';
import {
    COMPOSITION_PARAM,
    bindableBinaryOperators,
    Builtin,
    makeApplication,
    makeArray,
    makeAssignment,
    makeBoolean,
    makeCall,
    makeConditional,
    makeFunctionDefinition,
    makeIdentifierReference,
    makeLambda,
    makeLet,
    makeModule,
    makeNumber,
    makeString,
    parenthesize,
    makeOperatorBindingBare,
    makeOperatorBindingLeft,
    makeOperatorBindingRight,
    makeCurriedLambda,
} from '../../../src/ast';

describe('parser', function () {
    describe('#parseExpression', function () {
        it('should correctly parse a string literal', function () {
            const result = parseExpression('"Ja sam string literal"');
            const expected = makeString('Ja sam string literal');
            assert.deepStrictEqual(result, expected);

        });
        it('should correctly parse a boolean true literal', function () {
            const result = parseExpression('True');
            const expected = makeBoolean(true);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a boolean false literal', function () {
            const result = parseExpression('False');
            const expected = makeBoolean(false);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a simple numeric literal', function () {
            const result = parseExpression('1235');
            const expected = makeNumber(1235);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a decimal numeric literal', function () {
            const result = parseExpression('12.35');
            const expected = makeNumber(12.35);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a numeric literal starting with a dot', function () {
            const result = parseExpression('.123');
            const expected = makeNumber(0.123);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a numeric literal with exponentiation', function () {
            const result = parseExpression('12.35e-5');
            const expected = makeNumber(12.35e-5);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse simple literal addition', function () {
            const result= parseExpression('1+2');
            const expected = makeCall(Builtin.Add, [makeNumber(1), makeNumber(2)]);
            assert.deepStrictEqual(result, expected);
        });
        it('should parse longer literal additive expression as left-associative', function () {
            const result= parseExpression('1+2-3+4-5');
            const expected = makeCall(
                Builtin.Subtract,
                [
                    makeCall(
                        Builtin.Add,
                        [
                            makeCall(
                                Builtin.Subtract,
                                [
                                    makeCall(
                                        Builtin.Add,
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
            const expected = makeCall(Builtin.Multiply, [makeNumber(3), makeNumber(4)]);
            assert.deepStrictEqual(result, expected);
        });
        it('should parse longer literal multiplicative expression as left-associative', function () {
            const result= parseExpression('1*2/3%4*5');
            const expected = makeCall(
                Builtin.Multiply,
                [makeCall(
                    Builtin.Modulus,
                    [
                        makeCall(
                            Builtin.Divide,
                            [
                                makeCall(
                                    Builtin.Multiply,
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
            const result= parseExpression('1.6+2.1*3-4.98/.5');
            const expected = makeCall(
                Builtin.Subtract,
                [
                    makeCall(
                        Builtin.Add,
                        [
                            makeNumber(1.6),
                            makeCall(
                                Builtin.Multiply,
                                [
                                    makeNumber(2.1),
                                    makeNumber(3),
                                ],
                            ),
                        ],
                    ),
                    makeCall(
                        Builtin.Divide,
                        [
                            makeNumber(4.98),
                            makeNumber(.5),
                        ],
                    ),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should parse a literal arithmetic expression containing parentheses with correct operator precedence', function () {
            const result= parseExpression('(0.01+.2)*((3-4)/5)');
            const expected = makeCall(
                Builtin.Multiply,
                [
                    parenthesize(makeCall(
                        Builtin.Add,
                        [
                            makeNumber(0.01),
                            makeNumber(0.2),
                        ],
                    )),
                    parenthesize(makeCall(
                        Builtin.Divide,
                        [
                            parenthesize(makeCall(
                                Builtin.Subtract,
                                [
                                    makeNumber(3),
                                    makeNumber(4),
                                ],
                            )),
                            makeNumber(5),
                        ],
                    )),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a literal arithmetic expression that even casio calculators can\'t handle', function () {
            const result = parseExpression('9/3*(1+2)');
            const expected = makeCall(
                Builtin.Multiply,
                [
                    makeCall(
                        Builtin.Divide,
                        [
                            makeNumber(9),
                            makeNumber(3),
                        ],
                    ),
                    parenthesize(makeCall(
                        Builtin.Add,
                        [
                            makeNumber(1),
                            makeNumber(2),
                        ],
                    )),
                ],
            );
            assert.deepStrictEqual(result, expected);

        });
        it('should correctly parse a complex arithmetic expression containing identifier references', function () {
            const result= parseExpression('1*x/3%ligma*mate');
            const expected = makeCall(
                Builtin.Multiply,
                [makeCall(
                    Builtin.Modulus,
                    [
                        makeCall(
                            Builtin.Divide,
                            [
                                makeCall(
                                    Builtin.Multiply,
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
            const result = parseExpression('1 \n+ \r  x \n   \r  /3 \n- 4%y \n   *6');
            const expected = parseExpression('1+x/3-4%y*6');
            assert.deepStrictEqual(result, expected);

        });
        it('should correctly parse a logical not expression', function () {
            const result = parseExpression('!True');
            const expected = makeApplication(Builtin.Not, makeBoolean(true));
            assert.deepStrictEqual(result, expected);
        });
        it('should be whitespace insensitive when parsing logical not', function () {
            const result = parseExpression('!  \nx');
            const expected = parseExpression('!x');
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a logical expression with literals', function () {
            const result = parseExpression('True || !False && True');
            const expected = makeCall(
                Builtin.Or,
                [
                    makeBoolean(true),
                    makeCall(
                        Builtin.And,
                        [
                            makeApplication(
                                Builtin.Not,
                                makeBoolean(false),
                            ),
                            makeBoolean(true),
                        ],
                    ),
                ],
            );
            assert.deepStrictEqual(result, expected);
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
        it('should curry a function application (i.e., parse a multi-argument function as a call chain)', function () {
            const result = parseExpression('f(x,y,g(y),3,1+2,z)');
            const expected = parseExpression('f(x)(y)(g(y),3)(1+2,z)');
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly desugar a pipeline', function () {
            const result = parseExpression('x+3|>f(1)|>y|>g(3)');
            const expected = parseExpression('g(3)(y(f(1)(x+3)))');
            assert.deepStrictEqual(result, expected);
        });
        it('should be space insensitive when parsing pipelines', function () {
            const result = parseExpression('x+3    \n |> \r square(1)\n   |>  \r double \n  |>     \r  add(3)');
            const expected = parseExpression('x+3|>square(1)|>double|>add(3)');
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly desugar a composition', function () {
            const result = parseExpression('x.(m if p > 2 else n).z(4).g');
            const expected = makeLambda(
                COMPOSITION_PARAM,
                makeApplication(
                    parseExpression('x'),
                    makeApplication(
                        parseExpression('(m if p > 2 else n)'),
                        makeApplication(
                            parseExpression('z(4)'),
                            makeApplication(
                                parseExpression('g'),
                                makeIdentifierReference(COMPOSITION_PARAM),
                            ),
                        ),
                    ),
                ),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should be space insensitive when parsing compositions', function () {
            const result = parseExpression('f \t. \ng. \th(x, y) \t. \n  \t( a \n  if \tx \nelse \nb) \n.\nz \t(1)');
            const expected = parseExpression('f.g.h(x,y).(a if x else b).z(1)');
            assert.deepStrictEqual(result, expected);
        });
        it('should be able to work with function calls within arithmetic expressions', function () {
            const result = parseExpression('1-(a+double(5))+square(3)(4)*area(a,5)');
            const expected = makeCall(
                Builtin.Add,
                [
                    makeCall(
                        Builtin.Subtract,
                        [
                            parseExpression('1'),
                            parenthesize(makeCall(
                                Builtin.Add,
                                [
                                    parseExpression('a'),
                                    parseExpression('double(5)'),
                                ],
                            )),
                        ],
                    ),
                    makeCall(
                        Builtin.Multiply,
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
            const result = parseExpression('x    \n+ a ( \n 1,\r\n    2 )-3  + 5\n*f\n\r   (1 ,2) ( 4\n)  \n\r (1)-1');
            const expected = parseExpression('x+a(1,2)-3+5*f(1,2)(4)(1)-1');
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse an equality check', function () {
            const result = parseExpression('a+1==f(5)+3');
            const expected = makeCall(
                Builtin.Equal,
                [
                    parseExpression('a+1'),
                    parseExpression('f(5)+3'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse an inequality check', function () {
            const result = parseExpression('a+1!=f(5)+3');
            const expected = makeCall(
                Builtin.NotEqual,
                [
                    parseExpression('a+1'),
                    parseExpression('f(5)+3'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a less-then check', function () {
            const result = parseExpression('a-1<5');
            const expected = makeCall(
                Builtin.LessThan,
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
                Builtin.LessEqualThan,
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
                Builtin.GreaterThan,
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
                Builtin.GreaterEqualThan,
                [
                    parseExpression('a'),
                    parseExpression('5'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a logical conjunction', function () {
            const result = parseExpression('a==1 && b<3');
            const expected = makeCall(
                Builtin.And,
                [
                    parseExpression('a==1'),
                    parseExpression('b<3'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a longer logical conjunction', function () {
            const result = parseExpression('a==1 && b<3 && f(5) && g(4+3)-1');
            const expected = makeCall(
                Builtin.And,
                [
                    makeCall(
                        Builtin.And,
                        [
                            makeCall(
                                Builtin.And,
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
            const result = parseExpression('a==1 && 3*2==6 || b+3==1 && 4==5');
            const expected = makeCall(
                Builtin.Or,
                [
                    parseExpression('a==1 && 3*2==6'),
                    parseExpression('b+3==1 && 4==5'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a longer logical disjunction', function () {
            const result = parseExpression('!(a==1 || 3) && 3*2==6 || b+3==1 && 4==5 && 4*2==1');
            const expected = makeCall(
                Builtin.Or,
                [
                    makeCall(
                        Builtin.And,
                        [
                            makeCall(
                                Builtin.Not,
                                [
                                    parenthesize(makeCall(
                                        Builtin.Or,
                                        [
                                            parseExpression('a==1'),
                                            parseExpression('3'),
                                        ],
                                    )),
                                ],
                            ),
                            parseExpression('3*2==6'),
                        ],
                    ),
                    parseExpression('b+3==1 && 4==5 && 4*2==1'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should be space insensitive when parsing long logical expressions', function () {
            const result = parseExpression('!  \n( a  \r  \n==  1\n)   ||  \t  3  \n &&   \n3 \n  *2  == \r6 \n    || \n\r  b +  \n3 \n   \n==  \r\n1 \n && \n 4 == \r   5  &&  \n4 * 2== 1');
            const expected = parseExpression('!(a==1) || 3 && 3*2==6 || b+3==1 && 4==5 && 4*2==1');
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a simple conditional expression 1', function () {
            const result = parseExpression('"Mlad" if age<15 else "Star"');
            const expected = makeConditional(
                parseExpression('age<15'),
                parseExpression('"Mlad"'),
                parseExpression('"Star"'),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a simple conditional expression 2', function () {
            const result = parseExpression('4+5 if a==5 || a==3 else f(5)-1');
            const expected = makeConditional(
                parseExpression('a==5 || a==3'),
                parseExpression('4+5'),
                parseExpression('f(5)-1'),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse multi-level conditional expressions', function () {
            const result = parseExpression('4+5 if a!=3 && a!=4 else 3 if a>=5 else a>5 if a<4 else f(a)-1');
            const expected = makeConditional(
                parseExpression('a!=3 && a!=4'),
                parseExpression('4+5'),
                makeConditional(
                    parseExpression('a>=5'),
                    parseExpression('3'),
                    parseExpression('a>5 if a<4 else f(a)-1'),
                ),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a conditional expression with let', function () {
            const result = parseExpression(
                'let z=x*x in z if let y=x*2 in y>2 else let z=x*x in z+z',
            );
            const expected = makeLet(
                parseStatement('z = x*x'),
                makeConditional(
                    parseExpression('let y=x*2 in y>2'),
                    parseExpression('z'),
                    parseExpression('let z=x*x in z+z'),
                ),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should be space insensitive when parsing conditional expressions', function () {
            const result = parseExpression('4  \n\r  + \t \n 5 if \na \n !=  \n3  \r else \n   3 \r\n   if \ta  \n >= 5 \t\n\t   else \n a \t  > 5');
            const expected = parseExpression('4+5 if a!=3 else 3 if a>=5 else a>5');
            assert.deepStrictEqual(result, expected);
        });
        it('should be able to work with conditional inside arithmetic expressions', function () {
            const result = parseExpression('1+(3 if a==3 else b) if c<4 else f(2 if b==1+2 && 4 else 4)');
            const expected = makeConditional(
                parseExpression('c<4'),
                makeCall(
                    Builtin.Add,
                    [
                        parseExpression('1'),
                        parenthesize(parseExpression('3 if a==3 else b')),
                    ],
                ),
                makeCall(
                    makeIdentifierReference('f'),
                    [
                        makeConditional(
                            parseExpression('b==1+2 && 4'),
                            parseExpression('2'),
                            parseExpression('4'),
                        ),
                    ],
                ),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a simple lambda expression', function () {
            const result = parseExpression('(x)->x*x');
            const expected = makeLambda(
                'x',
                parseExpression('x*x'),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a multi-argument lambda expression', function () {
            const result = parseExpression('(x,y,f)->f(x,y)');
            const expected = makeCurriedLambda(
                ['x', 'y', 'f'],
                parseExpression('f(x,y)'),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a chained lambda expression', function () {
            const result = parseExpression('(f)->(x,y)->(z)->f(z)+x*y');
            const expected = makeCurriedLambda(
                ['f', 'x', 'y', 'z'],
                parseExpression('f(z) + x * y'),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should be space insensitive when parsing lambda expressions', function () {
            const result = parseExpression('(\t f \n ) \t -> \t \n (\t \t x ,\n y )\n ->  \t(\t z\n \t)\n \t-> \n \tf(z)+x*y');
            const expected = parseExpression('(f) ->(x,y)->(z)->f(z)+x*y');
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a let expression', function () {
            const result = parseExpression('let x=2 in x*x');
            const expected = makeLet(
                parseStatement('x=2'),
                parseExpression('x*x'),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a more complicated let expression', function () {
            const result = parseExpression('let func f(x)=1 if x == 0 else x*f(x-1) in f(4*y)+5');
            const expected = makeLet(
                parseStatement('func f(x)=1 if x==0 else x*f(x-1)'),
                parseExpression('f(4*y)+5'),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a multi-level let expression', function () {
            const result = parseExpression('let x=2 in let y=x*x in let z=y+y in z-2');
            const expected = makeLet(
                parseStatement('x=2'),
                makeLet(
                    parseStatement('y=x*x'),
                    makeLet(
                        parseStatement('z=y+y'),
                        parseExpression('z-2'),
                    ),
                ),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly desugar a multi-statement let expression', function () {
            const result = parseExpression('let x=2;y=x*x;z=y+y in z-2');
            const expected = parseExpression('let x=2 in let y=x*x in let z=y+y in z-2');
            assert.deepStrictEqual(result, expected);
        });
        it('should be insensitive to trailing the comma in multi-statement let expressions', function () {
            const result = parseExpression('let x=2;y=x*x;z=y+y; in z-2');
            const expected = parseExpression('let x=2;y=x*x;z=y+y in z-2');
            assert.deepStrictEqual(result, expected);
        });
        it('should be space insensitive when parsing multi-statement let expressions', function () {
            const result = parseExpression('let \n \t x=2;\n \ty=x*x \n \t ;\t  \n z=y+y\n ; \t \n \t in\t \n  z-2');
            const expected = parseExpression('let x=2;y=x*x;z=y+y; in z-2');
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a bare binary operator binding', function () {
            bindableBinaryOperators.forEach(operator => {
                const result = parseExpression(`\`${operator.name}\``);
                assert.deepStrictEqual(result, makeOperatorBindingBare(operator));
            });
        });
        it('should correctly parse a left binary operator binding', function () {
            bindableBinaryOperators.forEach(operator => {
                const result = parseExpression(`\`x${operator.name}\``);
                assert.deepStrictEqual(result, makeOperatorBindingLeft(operator, makeIdentifierReference('x')));
            });
        });
        it('should correctly parse a right binary operator binding', function () {
            bindableBinaryOperators.forEach(operator => {
                const result = parseExpression(`\`${operator.name}x\``);
                assert.deepStrictEqual(result, makeOperatorBindingRight(operator, makeIdentifierReference('x')));
            });
        });
        it('should correctly parse a tuple literal of size 2', function () {
            const result = parseExpression('(x+3,f(1)>4)');
            const expected = makeApplication(
                makeApplication(
                    Builtin.Tuple2,
                    parseExpression('x+3'),
                ),
                parseExpression('f(1)>4'),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a tuple literal of size 3', function () {
            const result = parseExpression('(x+3,f(1)>4, a || x>3 && b)');
            const expected = makeApplication(
                makeApplication(
                    makeApplication(
                        Builtin.Tuple3,
                        parseExpression('x+3'),
                    ),
                    parseExpression('f(1)>4'),
                ),
                parseExpression('a || x>3 && b'),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should be space insensitive when parsing tuple literals', function () {
            const result = parseExpression('(  \n \t x \n +\t3 \t \n, \n \t f \t( 1 \t) \t > \n4 \n \t)');
            const expected = parseExpression('(x+3,f(1)>4)');
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse an empty array literal', function () {
            assert.deepStrictEqual(parseExpression('[]'), makeArray());
        });
        it('should correctly parse a non-empty regular array literal', function () {
            // const result = parseExpression('[1, a+2, f(3), f(4) if c>1 else f(5)]');
            const result = parseExpression('[1, a+2, f(3), f(4) if c>1 else f(5)]');
            const expected = makeArray(
                parseExpression('1'),
                parseExpression('a+2'),
                parseExpression('f(3)'),
                parseExpression('f(4) if c>1 else f(5)'),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should be space insensitive when parsing regular array literals', function () {
            const result = parseExpression('[\t \n 1 \n, \t \n a+2 \n, \t  \nf(3), \n f(4) \n \t if  \t c>1 \t \n else \n \t f(5) \t]');
            const expected = parseExpression('[1,a+2,f(3),f(4) if c>1 else f(5)]');
            assert.deepStrictEqual(result, expected);
        });
        it('should be insensitive to a trailing comma in regular array literals', function () {
            const result = parseExpression('[1,2,3,]');
            const expected = parseExpression('[1,2,3]');
            assert.deepStrictEqual(result, expected);
        });
        it('should be insensitive to spaces around the trailing comma in regular array literals', function () {
            const result = parseExpression('[1,2,3  \n \t, \n \t ]');
            const expected = parseExpression('[1,2,3,]');
            assert.deepStrictEqual(result, expected);
        });
        it('should successfully parse a nested array literal', function () {
            const result = parseExpression('[[x,y,1],[x,y,2]]');
            const expected = makeArray(
                parseExpression('[x,y,1]'),
                parseExpression('[x,y,2]'),
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse an array spread literal', function () {
            const result = parseExpression('[1,*a,2,3,*[9,0],4]');
            const expected = makeCall(
                Builtin.Concat,
                [
                    makeArray(makeNumber(1)),
                    makeCall(
                        Builtin.Concat,
                        [
                            parseExpression('a'),
                            makeCall(
                                Builtin.Concat,
                                [
                                    parseExpression('[2,3]'),
                                    makeCall(
                                        Builtin.Concat,
                                        [
                                            parseExpression('[9,0]'),
                                            makeArray(makeNumber(4)),
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
        it('should be space insensitive when parsing array spread literals', function () {
            const result = parseExpression('[1 \n \t, \n* \t\n a,\n \t2,  \t3, \n* \t[ \n9  , \t0]\t,\n4\t]');
            const expected = parseExpression('[1,*a,2,3,*[9,0],4]');
            assert.deepStrictEqual(result, expected);
        });
        it('should be insensitive to a trailing comma when parsing array spread literals', function () {
            const result = parseExpression('[1,*a,2,3,*[9,0],4,]');
            const expected = parseExpression('[1,*a,2,3,*[9,0],4]');
            assert.deepStrictEqual(result, expected);
        });
        it('should be insensitive to spaces around the  trailing comma in array spread literals', function () {
            const result = parseExpression('[1,*a,2,3,*[9,0],4\t \n,\t \n ]');
            const expected = parseExpression('[1,*a,2,3,*[9,0],4]');
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse array concatenation', function () {
            const result = parseExpression('a++[1,2,3]');
            const expected = makeCall(
                Builtin.Concat,
                [
                    parseExpression('a'),
                    parseExpression('[1,2,3]'),
                ],
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
            const result = parseStatement('x1  \n  \n= \r  \n  9*\r (4 +3     \t) %4\n  + \n  (\n1-   \n 2)');
            const expected = parseStatement('x1=9*(4+3)%4+(1-2)');
            assert.deepStrictEqual(result, expected);
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
            const result = parseStatement('func\n \r some12Func       \n (\r   x  \n    , \n  y  )\n    = \n  x  \n *  f(y + 3  )');
            const expected = parseStatement('func some12Func(x,y)=x*f(y+3)');
            assert.deepStrictEqual(result, expected);
        });
    });

    describe('#parseModule', function () {
        it('should correctly parse an empty module', function () {
            const result = parseModule('');
            const expected = makeModule([]);
            assert.deepStrictEqual(result, expected);

        });
        it('should correctly parse a one-line module', function () {
            const result = parseModule('a=3');
            const expected = makeModule([parseStatement('a=3')]);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a one-line module with a function definition', function () {
            const result = parseModule('func add(x, y) = x + y');
            const expected = makeModule([parseStatement('func add(x, y) = x + y')]);
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
            const result = parseModule('\n   \na=3  \n   \n   \n');
            const expected = makeModule([parseStatement('a=3')]);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly parse a module', function () {
            const result = parseModule( `func square(x)=x*x
func add(x,y)=x+y
func larger(a,b)=a if a>=b else b
start=5
a=2
b=8 if a>2 && start==5 else 9
result=square(start) * 3 - larger(a,b)`);
            const expected = makeModule(
                [
                    parseStatement('func square(x)=x*x'),
                    parseStatement('func add(x,y)=x+y'),
                    parseStatement('func larger(a,b)=a if a>=b else b'),
                    parseStatement('start=5'),
                    parseStatement('a=2'),
                    parseStatement('b=8 if a>2 && start==5 else 9'),
                    parseStatement('result=square(start) * 3 - larger(a,b)'),
                ],
            );
            assert.deepStrictEqual(result, expected);
        });
        it('should ignore comments when parsing', function () {
            const result = parseModule( `func square(x)=x*x
// this is a function for adding stuff            
func add(x,y)=x+y
   // this is a function for finding a larger number
func larger(a,b)=a if a>=b else b

  // these are values   
start=5
a=2
b=8 if a>2 && start==5 else 9

// this is the final operation result   
result=square(start) * 3 - larger(a,b)`);
            const expected = parseModule( `func square(x)=x*x
func add(x,y)=x+y
func larger(a,b)=a if a>=b else b
start=5
a=2
b=8 if a>2 && start==5 else 9
result=square(start) * 3 - larger(a,b)`);
            assert.deepStrictEqual(result, expected);
        });
        it('should be space insensitive when parsing modules', function () {
            const result = parseModule( `        
              
func
            square(x)=x                    *x
        
            
           
func        add(  x, y)    =x  +
y    
func 
    larger             ( a, b )=    a if    
    a>= b else b  
        
        
start     =      5
    
    

a=2  

b=  8 if 
 a>  2  && start 
 ==  
  5 
  else  9

     
result       
        = square(    start  )
    * 3 - larger
    (   a, b)        
     
        `);
            const expected = makeModule(
                [
                    parseStatement('func square(x)=x*x'),
                    parseStatement('func add(x,y)=x+y'),
                    parseStatement('func larger(a,b)=a if a>=b else b'),
                    parseStatement('start=5'),
                    parseStatement('a=2'),
                    parseStatement('b=8 if a>2 && start==5 else 9'),
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

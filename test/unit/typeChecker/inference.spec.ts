import assert from 'assert';
import {
    Application,
    Conditional,
    Expression,
    ExpressionKind,
    Lambda,
    Let,
    LiteralKind,
} from '../../../src/typeChecker/expressions';
import { getInferer, Inferer } from '../../../src/typeChecker/inference';
import {
    BOOL_TYPE,
    Context,
    functionType,
    BIGINT_TYPE,
    typeVar,
    typeVarGenerator,
    unboundScheme,
    NUMBER_TYPE, TypeKind,
} from '../../../src/typeChecker/types';
import { UnificationError } from '../../../src/typeChecker/unification';

describe('inference', function () {
    describe('#infer', function () {
        let infer: Inferer;
        beforeEach(function () {
            infer = getInferer(typeVarGenerator());
        });
        it('should correctly infer the type of a literal bigint expression', function () {
            const expr: Expression = { kind: ExpressionKind.Literal, value: { kind: LiteralKind.BigInt, value: 4n } };
            const context = {};
            const { substitution, type } = infer(context, expr);
            assert.deepStrictEqual(substitution, {});
            assert.deepStrictEqual(type, { kind: TypeKind.BigInt });
        });
        it('should correctly infer the type of a literal number expression', function () {
            const expr: Expression = { kind: ExpressionKind.Literal, value: { kind: LiteralKind.Number, value: 4 } };
            const context = {};
            const { substitution, type } = infer(context, expr);
            assert.deepStrictEqual(substitution, {});
            assert.deepStrictEqual(type, { kind: TypeKind.Number });
        });
        it('should correctly infer the type of a literal boolean expression', function () {
            const expr: Expression = { kind: ExpressionKind.Literal, value: { kind: LiteralKind.Boolean, value: true } };
            const context = {};
            const { substitution, type } = infer(context, expr);
            assert.deepStrictEqual(substitution, {});
            assert.deepStrictEqual(type, { kind: TypeKind.Boolean });

        });
        it('should correctly infer the type of a simple lambda expression', function () {
            // \x -> 6
            const expr: Expression = {
                kind: ExpressionKind.Lambda,
                head: 'x',
                body: {
                    kind: ExpressionKind.Literal,
                    value: {
                        kind: LiteralKind.Number,
                        value: 6,
                    },
                },
            };
            const { type } = infer({}, expr);
            const expected = functionType(typeVar('t0'), NUMBER_TYPE);
            assert.deepStrictEqual(type, expected);
        });
        it('should correctly infer the type of a simple application given the correct context', function () {
            // x 1
            const expr: Expression = {
                kind: ExpressionKind.Application,
                func: {
                    kind: ExpressionKind.Identifier,
                    name: 'x',
                },
                argument: {
                    kind: ExpressionKind.Literal,
                    value: {
                        kind: LiteralKind.Number,
                        value: 1,
                    },
                },
            };
            const context: Context = {
                x: unboundScheme(functionType(NUMBER_TYPE, BOOL_TYPE)),
            };
            const { type } = infer(context, expr);
            assert.deepStrictEqual(type, BOOL_TYPE);
        });
        it('should correctly infer the type of a lambda expression given a correct context', function () {
            // \x -> y x
            const expr: Expression = {
                kind: ExpressionKind.Lambda,
                head: 'x',
                body: {
                    kind: ExpressionKind.Application,
                    func: {
                        kind: ExpressionKind.Identifier,
                        name: 'y',
                    },
                    argument: {
                        kind: ExpressionKind.Identifier,
                        name: 'x',
                    },
                },
            };
            const context: Context = {
                y: unboundScheme(functionType(typeVar('u0'), BOOL_TYPE)),
            };
            const { type } = infer(context, expr);
            const expected = functionType(typeVar('t0'), BOOL_TYPE);
            assert.deepStrictEqual(type, expected);
        });
        it('should correctly infer the type of the const function', function () {
            // \x -> (\y -> x)
            const constFunction: Expression = {
                kind: ExpressionKind.Lambda,
                head: 'x',
                body: {
                    kind: ExpressionKind.Lambda,
                    head: 'y',
                    body: {
                        kind: ExpressionKind.Identifier,
                        name: 'x',
                    },
                },
            };
            const { substitution, type } = infer({}, constFunction);
            assert.deepStrictEqual(substitution, {});
            const expected = functionType(typeVar('t0'), functionType(typeVar('t1'), typeVar('t0')));
            assert.deepStrictEqual(type, expected);
        });
        it('should correctly infer the type of the identity function', function () {
            const { substitution, type } = infer({}, ID_FUNCTION);
            assert.deepStrictEqual(substitution, {});
            const expected = functionType(typeVar('t0'), typeVar('t0'));
            assert.deepStrictEqual(type, expected);
        });
        it('should correctly infer the type of the identity function applied to the identity function', function() {
            const expr: Application = {
                kind: ExpressionKind.Application,
                func: ID_FUNCTION,
                argument: ID_FUNCTION,
            };
            const { type } = infer({}, expr);
            const expected = functionType(typeVar('t1'), typeVar('t1'));
            assert.deepStrictEqual(type, expected);
        });
        it('should correctly infer the type of a let expression', function () {
            // let x = \x -> x in x 6
            const letExpr: Let = {
                kind: ExpressionKind.Let,
                variable: 'x',
                initializer: ID_FUNCTION,
                body: {
                    kind: ExpressionKind.Application,
                    func: {
                        kind: ExpressionKind.Identifier,
                        name: 'x',
                    },
                    argument: {
                        kind: ExpressionKind.Literal,
                        value: {
                            kind: LiteralKind.BigInt,
                            value: 6n,
                        },
                    },
                },
            };
            const { type } = infer({}, letExpr);
            assert.deepStrictEqual(type, BIGINT_TYPE);
        });
        it('should correctly infer the type of a well-typed conditional with variables from context', function () {
            const conditional: Conditional = {
                kind: ExpressionKind.Conditional,
                condition: {
                    kind: ExpressionKind.Identifier,
                    name: 'a',
                },
                thenBranch: {
                    kind: ExpressionKind.Identifier,
                    name: 'b',
                },
                elseBranch: {
                    kind: ExpressionKind.Identifier,
                    name: 'c',
                },
            };
            const context = {
                a: unboundScheme(BOOL_TYPE),
                b: unboundScheme(NUMBER_TYPE),
                c: unboundScheme(NUMBER_TYPE),
            };
            assert.deepStrictEqual(infer(context, conditional).type, NUMBER_TYPE);
        });
        it('should correctly detect a unification error on the branches', function () {
            const conditional: Conditional = {
                kind: ExpressionKind.Conditional,
                condition: {
                    kind: ExpressionKind.Identifier,
                    name: 'a',
                },
                thenBranch: {
                    kind: ExpressionKind.Identifier,
                    name: 'b',
                },
                elseBranch: {
                    kind: ExpressionKind.Identifier,
                    name: 'c',
                },
            };
            const context = {
                a: unboundScheme(BOOL_TYPE),
                b: unboundScheme(NUMBER_TYPE),
                c: unboundScheme(BOOL_TYPE),
            };
            assert.throws(() => infer(context, conditional), UnificationError);
        });
        it('should correctly detect an invalid condition expression', function () {
            const conditional: Conditional = {
                kind: ExpressionKind.Conditional,
                condition: {
                    kind: ExpressionKind.Identifier,
                    name: 'a',
                },
                thenBranch: {
                    kind: ExpressionKind.Identifier,
                    name: 'b',
                },
                elseBranch: {
                    kind: ExpressionKind.Identifier,
                    name: 'c',
                },
            };
            const context = {
                a: unboundScheme(NUMBER_TYPE),
                b: unboundScheme(BOOL_TYPE),
                c: unboundScheme(BOOL_TYPE),
            };
            assert.throws(() => infer(context, conditional), UnificationError);
        });
        it('should fail when let would normally generalize', function () {
            // todo
        });
    });
});

// \x -> x
const ID_FUNCTION: Lambda = {
    kind: ExpressionKind.Lambda,
    head: 'x',
    body: {
        kind: ExpressionKind.Identifier,
        name: 'x',
    },
};


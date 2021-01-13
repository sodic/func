import { OccursError, UnificationError, unify } from '../../../src/semantics/unification';
import assert from 'assert';
import {
    TFunction,
} from '../../../src/semantics/types/type';
import { BIGINT_TYPE, BOOL_TYPE, NUMBER_TYPE, STRING_TYPE } from '../../../src/semantics/types/common';
import { functionType, polymorphicType, typeVar } from '../../../src/semantics/types/builders';
import { EMPTY_SUBSTITUTION, Substitution } from '../../../src/semantics/substitution';

describe('unification', function () {
    describe('#unify', function () {
        it('should return an empty substitution when unifying 2 number types', function () {
            const result = unify(NUMBER_TYPE, NUMBER_TYPE);
            assert.deepStrictEqual(result, EMPTY_SUBSTITUTION);
        });
        it('should return an empty substitution type when unifying 2 bool types', function () {
            const result = unify(BOOL_TYPE, BOOL_TYPE);
            assert.deepStrictEqual(result, EMPTY_SUBSTITUTION);
        });
        it('should return an empty substitution when unifying 2 bigint types', function () {
            const result = unify(BIGINT_TYPE, BIGINT_TYPE);
            assert.deepStrictEqual(result, EMPTY_SUBSTITUTION);
        });
        it('should return an empty substitution when unifying 2 string types', function () {
            const result = unify(STRING_TYPE, STRING_TYPE);
            assert.deepStrictEqual(result, EMPTY_SUBSTITUTION);
        });
        it('should return an empty substitution type when unifying type variables of same name', function () {
            const result = unify(typeVar('u1'), typeVar('u1'));
            assert.deepStrictEqual(result, EMPTY_SUBSTITUTION);
        });
        it('should substitute a type variable with an int literal when unifying an int type with a type variable', function () {
            const result1 = unify(NUMBER_TYPE, typeVar('u1'));
            assert.deepStrictEqual(result1, { 'u1': NUMBER_TYPE });
            const result2 = unify(typeVar('u1'), NUMBER_TYPE);
            assert.deepStrictEqual(result2, { 'u1': NUMBER_TYPE });
        });
        it('should substitute a type variable with a boolean literal when unifying a boolean type with a type variable', function () {
            const result1 = unify(BOOL_TYPE, typeVar('u1'));
            assert.deepStrictEqual(result1, { 'u1': BOOL_TYPE });
            const result2 = unify(typeVar('u1'), BOOL_TYPE);
            assert.deepStrictEqual(result2, { 'u1': BOOL_TYPE });
        });
        it('should substitute the first type variable name for the second type when unifying two type variables', function () {
            const typeVar1 = typeVar('u1');
            const typeVar2 = typeVar('u2');
            const result = unify(typeVar1, typeVar2);
            assert.deepStrictEqual(result, { [typeVar1.name]:  typeVar2 });
        });
        it('should throw a unification error when uniting a number type with a bool type', function () {
            assert.throws(() => unify(NUMBER_TYPE, BOOL_TYPE), UnificationError);
            assert.throws(() => unify(BOOL_TYPE, NUMBER_TYPE), UnificationError);
        });
        it('should throw a unification error when uniting a function type with a number type', function () {
            const funType = functionType(typeVar('u1'), typeVar('u2'));
            assert.throws(() => unify(funType, BIGINT_TYPE), UnificationError);
            assert.throws(() => unify(BIGINT_TYPE, funType), UnificationError);
        });
        it('should throw a unification error when uniting a function type with a bigint type', function () {
            const funType = functionType(typeVar('u1'), typeVar('u2'));
            assert.throws(() => unify(funType, BIGINT_TYPE), UnificationError);
            assert.throws(() => unify(BIGINT_TYPE, funType), UnificationError);
        });
        it('should correctly detect an occurs error', function () {
            const funType: TFunction = functionType(typeVar('u1'), typeVar('u2'));
            assert.throws(() => unify(funType, typeVar('u2')), OccursError);
        });
        it('should correctly unify two function types 1', function () {
            const type1: TFunction = functionType(BOOL_TYPE, typeVar('u2'));
            const type2: TFunction = functionType(typeVar('u1'), BIGINT_TYPE);
            const result = unify(type1, type2);
            const expected = {
                'u1': BOOL_TYPE,
                'u2': BIGINT_TYPE,
            };
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly unify two function types 2', function () {
            const type1: TFunction = functionType(BOOL_TYPE, typeVar('u2'));
            const type2: TFunction = functionType(typeVar('u1'), typeVar('u1'));
            const result = unify(type1, type2);
            const expected = {
                'u1': BOOL_TYPE,
                'u2': BOOL_TYPE,
            };
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly unify two generic function types', function () {
            const result = unify(
                functionType(typeVar('u1'), typeVar('u2')),
                functionType(typeVar('u1'), typeVar('u4'), typeVar('u5')),
            );
            const expected = {
                'u2': functionType(typeVar('u4'), typeVar('u5')),
            };
            assert.deepStrictEqual(result, expected);

        });
        it('should correctly unify two polymorphic types', function () {
            const t1 = polymorphicType('SomeConstructor', [
                NUMBER_TYPE,
                typeVar('u1'),
                functionType(typeVar('u1'), typeVar('u2')),
                typeVar('u4'),
                BIGINT_TYPE,
            ]);
            const t2 = polymorphicType('SomeConstructor', [
                typeVar('u1'),
                typeVar('u1'),
                functionType(typeVar('u1'), STRING_TYPE),
                typeVar('u3'),
                typeVar('u4'),
            ]);
            const result = unify(t1, t2);
            const expected: Substitution = {
                'u1': NUMBER_TYPE,
                'u2': STRING_TYPE,
                'u3': BIGINT_TYPE,
                'u4': BIGINT_TYPE,
            };
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly unify two type variables', function () {
            const result = unify(typeVar('u1'), typeVar('u2'));
            const expected = {
                'u1': typeVar('u2'),
            };
            assert.deepStrictEqual(result, expected);
        });

    });
});

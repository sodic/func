import assert from 'assert';
import { composeSubstitutions, substituteInType, Substitution } from '../../../src/semantics/substitution';
import { BIGINT_TYPE, BOOL_TYPE, NUMBER_TYPE, STRING_TYPE } from '../../../src/semantics/types/common';
import { functionType, polymorphicType, typeVar } from '../../../src/semantics/types/builders';

describe('substitution', function () {
    describe('#substituteInType', function () {
        it('should correctly substitute a type variable to a number', function () {
            const result = substituteInType({ 'u0': NUMBER_TYPE }, typeVar('u0'));
            assert.deepStrictEqual(result, NUMBER_TYPE);
        });
        it('should correctly substitute a type variable to a bigint', function () {
            const result = substituteInType({ 'u0': BIGINT_TYPE }, typeVar('u0'));
            assert.deepStrictEqual(result, BIGINT_TYPE);
        });
        it('should correctly substitute a type variable to a boolean', function () {
            const result = substituteInType({ 'u0': BOOL_TYPE }, typeVar('u0'));
            assert.deepStrictEqual(result, BOOL_TYPE);
        });
        it('should correctly substitute in a function type', function () {
            const funType = functionType(typeVar('u0'), typeVar('u1'));
            const substitution: Substitution = {
                'u0': BIGINT_TYPE,
                'u1': NUMBER_TYPE,
            };
            const result = substituteInType(substitution, funType);
            const expected = functionType(BIGINT_TYPE, NUMBER_TYPE);
            assert.deepStrictEqual(result, expected);
        });
        it('should correctly substitute in a general polymorphic type', function () {
            const t = polymorphicType('SomeConstructor', [
                NUMBER_TYPE,
                typeVar('u1'),
                functionType(typeVar('u1'), typeVar('u2')),
            ]);
            const substitution: Substitution = {
                'u1': BIGINT_TYPE,
                'u2': functionType(STRING_TYPE, NUMBER_TYPE),
            };
            const result = substituteInType(substitution, t);
            const expected = polymorphicType('SomeConstructor', [
                NUMBER_TYPE,
                BIGINT_TYPE,
                functionType(BIGINT_TYPE, STRING_TYPE, NUMBER_TYPE),
            ]);
            assert.deepStrictEqual(result, expected);
        });
    });
    describe('#composeSubstitution', function () {
        it('should correctly override when composing substitutions', function () {
            const sub1: Substitution = {
                'u0': NUMBER_TYPE,
                'u1': typeVar('u2'),
                'u3': functionType(NUMBER_TYPE, typeVar('u4')),
            };
            const sub2: Substitution = {
                'u4': NUMBER_TYPE,
                'u2': functionType(BOOL_TYPE, NUMBER_TYPE),
                'u5': typeVar('t6'),
                'u0': BOOL_TYPE,
            };
            const composition = composeSubstitutions(sub1, sub2);
            const expected: Substitution = {
                'u0': BOOL_TYPE,
                'u1': functionType(BOOL_TYPE, NUMBER_TYPE),
                'u2': functionType(BOOL_TYPE, NUMBER_TYPE),
                'u3': functionType(NUMBER_TYPE, NUMBER_TYPE),
                'u4': NUMBER_TYPE,
                'u5': typeVar('t6'),
            };
            assert.deepStrictEqual(composition, expected);
        });
    });
});

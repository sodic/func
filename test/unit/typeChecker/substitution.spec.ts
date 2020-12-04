import assert from 'assert';
import { composeSubstitutions, substituteInType, Substitution } from '../../../src/typeChecker/substitution';
import {
    BOOL_TYPE,
    BIGINT_TYPE,
    typeVar,
    NUMBER_TYPE,
    functionType,
} from '../../../src/typeChecker/types';

describe('substitution', function () {
    describe('#substituteInType', function () {
        it('should substitute a type variable to a number correctly', function () {
            const result = substituteInType({ 'u0': NUMBER_TYPE }, typeVar('u0'));
            assert.deepStrictEqual(result, NUMBER_TYPE);
        });
        it('should substitute a type variable to a bigint correctly', function () {
            const result = substituteInType({ 'u0': BIGINT_TYPE }, typeVar('u0'));
            assert.deepStrictEqual(result, BIGINT_TYPE);
        });
        it('should substitute a type variable to a boolean correctly', function () {
            const result = substituteInType({ 'u0': BOOL_TYPE }, typeVar('u0'));
            assert.deepStrictEqual(result, BOOL_TYPE);
        });
        it('should substitute in function type correctly', function () {
            const funType = functionType(typeVar('u0'), typeVar('u1'));
            const substitution: Substitution = {
                'u0': BIGINT_TYPE,
                'u1': NUMBER_TYPE,
            };
            const result = substituteInType(substitution, funType);
            const expected = functionType(BIGINT_TYPE, NUMBER_TYPE);
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

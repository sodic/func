import assert from 'assert';
import { composeSubstitutions, substituteInType, Substitution } from '../../src/typeChecker/substitution';
import { BOOL_TYPE, functionType, INT_TYPE, typeVar } from '../../src/typeChecker/types';

describe('substitution', function () {
	describe('#substituteInType', function () {
		it('should substitute a type variable to an int correctly', function () {
			const result = substituteInType({ 'u0': INT_TYPE }, typeVar('u0'));
			assert.deepStrictEqual(result, INT_TYPE);
		});
		it('should substitute a type variable to a boolean correctly', function () {
			const result = substituteInType({ 'u0': BOOL_TYPE }, typeVar('u0'));
			assert.deepStrictEqual(result, BOOL_TYPE);
		});
		it('should substitute in function type correctly', function () {
			const funType = functionType(typeVar('u0'), typeVar('u1'));
			const substitution: Substitution = {
				'u0': INT_TYPE,
				'u1': BOOL_TYPE,
			};
			const result = substituteInType(substitution, funType);
			const expected = functionType(INT_TYPE, BOOL_TYPE);
			assert.deepStrictEqual(result, expected);
		});
	});
	describe('#composeSubstitution', function () {
		it('should correctly override when composing substitutions', function () {
			const sub1: Substitution = {
				'u0': INT_TYPE,
				'u1': typeVar('u2'),
				'u3': functionType(INT_TYPE, typeVar('u3')),
			};
			const sub2: Substitution = {
				'u4': INT_TYPE,
				'u5': typeVar('t6'),
				'u0': BOOL_TYPE,
			};
			const composition = composeSubstitutions(sub1, sub2);
			const expected: Substitution = {
				'u0': BOOL_TYPE,
				'u1': typeVar('u2'),
				'u3': functionType(INT_TYPE, typeVar('u3')),
				'u4': INT_TYPE,
				'u5': typeVar('t6'),
			};
			assert.deepStrictEqual(composition, expected);
		});
	});
});

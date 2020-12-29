import assert from 'assert';
import { difference, mapObjectValues, union, zip } from '../../src/util';

describe('set operations', function () {
    describe('#union', function () {
        it('should correctly calculate the union of two non-empty sets', function () {
            const s1 = new Set([1,2,3]);
            const s2 = new Set([3,4,5]);
            assert.deepStrictEqual(union(s1, s2), new Set([1,2,3,4,5]));
        });
        it('should have the commutative property', function () {
            const s1 = new Set([1,2,3,4,5,3]);
            const s2 = new Set([2,5,6,2,1,4]);
            assert.deepStrictEqual(union(s1, s2), union(s2, s1));
        });
        it('should correctly calculate the union of two empty sets', function () {
            const s1 = new Set();
            const s2 = new Set();
            assert.deepStrictEqual(union(s1, s2), new Set());
        });
        it('should treat an empty set as a neutral element', function () {
            const s1 = new Set([1,2,3,4,5]);
            const s2 = new Set();
            const s3 = new Set(['a', 'b', 'c']);
            assert.deepStrictEqual(union(s1, new Set()), s1);
            assert.deepStrictEqual(union(new Set(), s2), s2);
            assert.deepStrictEqual(union(s3, new Set()), s3);
        });
    });
    describe('#difference', function () {
        it('should correctly calculate the difference of two overlapping sets', function () {
            const s1 = new Set([1,2,3]);
            const s2 = new Set([3,4,5]);
            assert.deepStrictEqual(difference(s1, s2), new Set([1,2]));
            assert.deepStrictEqual(difference(s2, s1), new Set([4,5]));
        });
        it('should not generally have the commutative property', function () {
            const s1 = new Set([1,2,3,4,5,3]);
            const s2 = new Set([2,5,6,2,1,4]);
            assert.notDeepStrictEqual(difference(s1, s2), difference(s2, s1));
        });
        it('should correctly calculate the difference of two empty sets', function () {
            const s1 = new Set();
            const s2 = new Set();
            assert.deepStrictEqual(difference(s1, s2), new Set());
        });
        it('should calculate the difference of two non-overlapping sets', function () {
            const s1 = new Set([1,2,3,4,5]);
            const s2 = new Set([6,7,8,9,10]);
            assert.deepStrictEqual(difference(s1, s2), s1);
            assert.deepStrictEqual(difference(s2, s1), s2);
        });
    });
});

describe('object operations', function () {
    describe('#mapObjectValues', function () {
        it('should correctly map object values', function () {
            const o = {
                a: 1,
                b: 2,
                c: -3,
            };
            const o2 = {
                a: 1,
                b: 4,
                c: 9,
            };
            const mapped = mapObjectValues(o, value => value * value);
            assert.deepStrictEqual(mapped, o2);
        });
    });
});

describe('array operations', function () {
    describe('#zip', function () {
        it('should correctly zip two arrays when the first array is shorter', function () {
            const a = [1, 2, 3];
            const b = ['one', 'two', 'three', 'four', 'five'];
            assert.deepStrictEqual(zip(a, b), [[1, 'one'], [2, 'two'], [3, 'three']]);
        });
        it('should correctly zip two arrays when the second array is shorter', function () {
            const a = [1, 2, 3, 4, 5];
            const b = ['one', 'two', 'three'];
            assert.deepStrictEqual(zip(a, b), [[1, 'one'], [2, 'two'], [3, 'three']]);
        });
        it('should correctly zip two arrays when the first array is empty', function () {
            const a: number[] = [];
            const b = ['one', 'two', 'three'];
            assert.deepStrictEqual(zip(a, b), []);
        });
        it('should correctly zip two arrays when the second array is empty', function () {
            const a = [1, 2, 3, 4, 5];
            const b: string[] = [];
            assert.deepStrictEqual(zip(a, b), []);
        });
        it('should correctly zip two arrays when both arrays are empty', function () {
            const a: number[] = [];
            const b: string[] = [];
            assert.deepStrictEqual(zip(a, b), []);
        });
    });
});

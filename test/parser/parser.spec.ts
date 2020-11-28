import assert from 'assert';
import { parse } from '../../src/parser';
import { FunctionCall } from '../../src/parser/ast/expressions';

describe('parser', function () {
    describe('#parse', function () {
        it('should correctly parse example string 1', function () {
            const result= parse('1+2');
            const expected: FunctionCall = {
                kind: 'call',
                functionName: '+',
                arguments: [
                    {
                        kind: 'literal',
                        value: { kind: 'number', value: 1 },
                    },
                    {
                        kind: 'literal',
                        value: { kind: 'number', value: 2 },
                    }],
            };
            assert.deepStrictEqual(result, expected);
        });
    });
});

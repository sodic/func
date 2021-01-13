import assert from 'assert';
import { Builtin, makeAssignment, makeCall, makeModule, makeNumber, makeString } from '../../../src/ast';
import { generateJs } from '../../../src/codeGeneration';
import { evaluateAndRead } from '../../helpers';
import { isFailure } from '../../../src/util';

describe('codeGeneration', function () {
    describe('generateJs', function () {
        it('should correctly generate code calling builtin functions', function () {
            const expression = makeModule([
                makeAssignment(
                    'result',
                    makeCall(
                        Builtin.Constant,
                        [
                            makeCall(
                                Builtin.Identity,
                                [makeNumber(1)],
                            ),
                            makeString('One'.split('')),
                        ],
                    ),
                ),
            ]);
            const result = generateJs(expression);
            if (isFailure(result)) {
                assert.fail('Code generation failed');
            }
            const expected = 1;
            assert.deepStrictEqual(evaluateAndRead(result.value, 'result'), expected);
        });
    });
});

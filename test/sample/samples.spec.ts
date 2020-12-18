import { promises as fs } from 'fs';
import assert from 'assert';
import { compile } from '../../src';
import { isFailure } from '../../src/util';
import { functionScheme } from '../../src/checker/inference/helpers';
import { NUMBER_SCHEME, NUMBER_TYPE } from '../../src/checker/types/common';
import { Scheme, showScheme } from '../../src/checker/types/scheme';
import { curriedFunctionType, functionType, typeVar } from '../../src/checker/types/builders';

describe('samples', function () {
    describe('valid', function () {
        const specification: TestDefinition[] = [
            {
                sampleNumber: 1,
                expectedTypes: {
                    fact: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
                    combinations: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
                    result: NUMBER_SCHEME,
                },
                expectedValues: {
                    result: 10,
                },
            },
            {
                sampleNumber: 2,
                expectedTypes: {
                    area: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
                    result: NUMBER_SCHEME,
                },
                expectedValues: {
                    result: 4,
                },
            },
            {
                sampleNumber: 3,
                expectedTypes: {
                    applyNTimes: functionScheme(
                        NUMBER_TYPE,
                        functionType(typeVar('u1'), typeVar('u1')),
                        typeVar('u1'),
                        typeVar('u1'),
                    ),
                    multiply: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
                    square: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
                    apply5Times: functionScheme(
                        functionType(typeVar('u1'), typeVar('u1')),
                        typeVar('u1'),
                        typeVar('u1'),
                    ),
                    power32: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
                    result: NUMBER_SCHEME,
                },
                expectedValues: {
                    result: 2 ** 32,
                },
            },
            {
                sampleNumber: 4,
                expectedTypes: {
                    raiseToPower: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
                    flipArgs: functionScheme(
                        curriedFunctionType(typeVar('u1'), typeVar('u2'), typeVar('u3')),
                        typeVar('u2'),
                        typeVar('u1'),
                        typeVar('u3'),
                    ),
                    raise3To: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
                    raiseTo3: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
                    threeSquared: NUMBER_SCHEME,
                    twoToTheThird: NUMBER_SCHEME,
                },
                expectedValues: {
                    threeSquared: 9,
                    twoToTheThird: 8,
                },
            },
        ];

        specification.forEach(testSample);

        function testSample({ sampleNumber, expectedTypes, expectedValues }: TestDefinition ) {
            it(`should correctly parse and evaluate sample ${sampleNumber}`, async function () {
                const sample = await readSampleFile(`sample-${sampleNumber}`);

                const compilerOutput = compile(sample);
                if (isFailure(compilerOutput)) {
                    assert(false, compilerOutput.error);
                }
                const { types, code } = compilerOutput.value;

                Object.entries(expectedTypes).forEach(([name, expected]) => {
                    const actual = types[name];
                    assert.deepStrictEqual(types[name], expected,
                        `${name}: Expected "${showScheme(expected)}" but got ${showScheme(actual)}`);
                });

                Object.entries(expectedValues).forEach(([name, expectedValue]) => {
                    const evaluationResult = evaluateAndRead(code, name);
                    assertDoubleEquals(evaluationResult, expectedValue,
                        `Expected ${name} to be "${expectedValue} but was ${evaluationResult} `);
                });
            });
        }
    });
});

type TestDefinition = {
    sampleNumber: number;
    expectedTypes: {
        [name: string ]: Scheme;
    };
    expectedValues: {
        [name: string ]: any;
    };
};

function assertDoubleEquals(n1: number, n2: number, message: string) {
    assert.deepStrictEqual(n1.toFixed(8), n2.toFixed(8), message);
}

function evaluateAndRead(source: string, variable: string) {
    return (new Function(`${source}\nreturn ${variable};`))();
}

function readSampleFile(fileName: string) {
    const sampleRoot = 'test/sample/samples';
    return fs.readFile(`${sampleRoot}/${fileName}`, 'utf-8');

}

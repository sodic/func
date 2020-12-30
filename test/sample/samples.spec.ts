import { promises as fs } from 'fs';
import assert from 'assert';
import { compileVerbose } from '../../src';
import { isFailure } from '../../src/util';
import { functionScheme, polymorphicScheme } from '../../src/checker/inference/helpers';
import {
    BOOL_SCHEME,
    BOOL_TYPE,
    NUMBER_SCHEME,
    NUMBER_TYPE,
    STRING_SCHEME,
    STRING_TYPE,
} from '../../src/checker/types/common';
import { Scheme, showScheme } from '../../src/checker/types/scheme';
import { curriedFunctionType, functionType, polymorphicType, typeVar } from '../../src/checker/types/builders';
import { evaluateAndRead } from '../helpers';
import { TupleConstructor } from '../../src/checker/types/type';

const specification: TestDefinition[] = [
    {
        file: 'bare',
        expectedTypes: {
            casio: NUMBER_SCHEME,
        },
        expectedValues: {
            casio: 9,
        },
    },
    {
        file: 'discrete',
        expectedTypes: {
            fact: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            combinations: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            gcd: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            lcd: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            divisibleBy: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
            isLeapYear: functionScheme(NUMBER_TYPE, BOOL_TYPE),
            _1c0: NUMBER_SCHEME,
            _5c3: NUMBER_SCHEME,
            _12c4: NUMBER_SCHEME,
            gcd_5_7: NUMBER_SCHEME,
            gcd_18_12: NUMBER_SCHEME,
            gcd_63_78: NUMBER_SCHEME,
            gcd_14288_21432: NUMBER_SCHEME,
            lcd_17_11: NUMBER_SCHEME,
            lcd_12_18: NUMBER_SCHEME,
            lcd_63_78: NUMBER_SCHEME,
            lcd_14288_21432: NUMBER_SCHEME,
            leap_1700: BOOL_SCHEME,
            leap_2000: BOOL_SCHEME,
            leap_2012: BOOL_SCHEME,
            leap_2016: BOOL_SCHEME,
            leap_2017: BOOL_SCHEME,
        },
        expectedValues: {
            _1c0: 1,
            _5c3: 10,
            _12c4: 495,
            gcd_5_7: 1,
            gcd_18_12: 6,
            gcd_63_78: 3,
            gcd_14288_21432: 7144,
            lcd_17_11: 17 * 11,
            lcd_12_18: 36,
            lcd_63_78: 1638,
            lcd_14288_21432: 42864,
            leap_1700: false,
            leap_2000: true,
            leap_2012: true,
            leap_2016: true,
            leap_2017: false,
        },
    },
    {
        file: 'circle',
        expectedTypes: {
            pi: NUMBER_SCHEME,
            calcArea: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            calcCircumference: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            area: NUMBER_SCHEME,
            circumference: NUMBER_SCHEME,
        },
        expectedValues: {
            pi: 3.14159265359,
            area: 4,
            circumference: 5,
        },
    },
    {
        file: 'recursive-apply',
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
        file: 'power',
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
    {
        file: 'church',
        expectedTypes: {
            true: functionScheme(typeVar('u1'), typeVar('u2'), typeVar('u1')),
            false: functionScheme(typeVar('u1'), typeVar('u2'), typeVar('u2')),
            pair: functionScheme(
                typeVar('u1'),
                typeVar('u2'),
                curriedFunctionType(typeVar('u1'), typeVar('u2'), typeVar('u3')),
                typeVar('u3'),
            ),
            _first: functionScheme(
                functionType(
                    curriedFunctionType(typeVar('u1'), typeVar('u2'), typeVar('u1')),
                    typeVar('u3'),
                ),
                typeVar('u3'),
            ),
            _second: functionScheme(
                functionType(
                    curriedFunctionType(typeVar('u1'), typeVar('u2'), typeVar('u2')),
                    typeVar('u3'),
                ),
                typeVar('u3'),
            ),
            movie1: functionScheme(
                curriedFunctionType(NUMBER_TYPE, STRING_TYPE, typeVar('u3')),
                typeVar('u3'),
            ),
            movie2: functionScheme(
                curriedFunctionType(NUMBER_TYPE, STRING_TYPE, typeVar('u3')),
                typeVar('u3'),
            ),
            movie3: functionScheme(
                curriedFunctionType(BOOL_TYPE, STRING_TYPE, typeVar('u3')),
                typeVar('u3'),
            ),
            movie4: functionScheme(
                curriedFunctionType(STRING_TYPE, NUMBER_TYPE, typeVar('u3')),
                typeVar('u3'),
            ),
            twelve: NUMBER_SCHEME,
            hours: STRING_SCHEME,
            _true: BOOL_SCHEME,
            five: NUMBER_SCHEME,
        },
        expectedValues: {
            twelve: 12,
            hours: 'Hours',
            _true: true,
            five:  5,
        },
    },
    {
        file: 'prime',
        expectedTypes: {
            testSequence: functionScheme(
                functionType(typeVar('u1'), BOOL_TYPE),
                functionType(typeVar('u1'), BOOL_TYPE),
                functionType(typeVar('u1'), typeVar('u1')),
                typeVar('u1'),
                BOOL_TYPE,
            ),
            add: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            lessThan: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
            divisibleBy: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
            anyInRange: functionScheme(
                functionType(NUMBER_TYPE, BOOL_TYPE),
                NUMBER_TYPE,
                NUMBER_TYPE,
                NUMBER_TYPE,
                BOOL_TYPE,
            ),
            isPrime: functionScheme(NUMBER_TYPE, BOOL_TYPE),
            is1Prime: BOOL_SCHEME,
            is2Prime: BOOL_SCHEME,
            is4Prime: BOOL_SCHEME,
            is7Prime: BOOL_SCHEME,
            is27Prime: BOOL_SCHEME,
            is63Prime: BOOL_SCHEME,
            is97Prime: BOOL_SCHEME,
            is117Prime: BOOL_SCHEME,
            is269Prime: BOOL_SCHEME,
        },
        expectedValues: {
            is1Prime: false,
            is2Prime: true,
            is4Prime: false,
            is7Prime: true,
            is27Prime: false,
            is63Prime: false,
            is97Prime: true,
            is117Prime: false,
            is269Prime: true,
        },
    },
    {
        file: 'tuples',
        expectedTypes: {
            luka: polymorphicScheme(TupleConstructor[2], [STRING_TYPE, NUMBER_TYPE]),
            marko: polymorphicScheme(TupleConstructor[2], [STRING_TYPE, NUMBER_TYPE]),
            isAdult: functionScheme(
                polymorphicType(TupleConstructor[2], [typeVar('u1'), NUMBER_TYPE]),
                BOOL_TYPE,
            ),
            lukaReport: STRING_SCHEME,
            totalAge: NUMBER_SCHEME,
        },
        expectedValues: {
            luka: ['Luka', 23],
            marko: ['Marko', 25],
            lukaReport: 'Luka is old enough to drive',
            totalAge: 23 + 25,
        },
    },
];

type TestDefinition = {
    file: string;
    expectedTypes: {
        [name: string ]: Scheme;
    };
    expectedValues: {
        [name: string ]: unknown;
    };
};

describe('samples', function () {
    describe('valid', function () {
        specification.forEach(testSample);
    });
});

function testSample({ file, expectedTypes, expectedValues }: TestDefinition ) {
    it(`should correctly parse and evaluate sample "${file}"`, async function () {
        const sample = await readSampleFile(file);

        const compilerOutput = compileVerbose(sample);
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
            assertEquals(evaluationResult, expectedValue,
                `Expected ${name} to be "${expectedValue} but was ${evaluationResult} `);
        });
    });
}

function readSampleFile(fileName: string) {
    const sampleRoot = 'test/sample/samples';
    return fs.readFile(`${sampleRoot}/${fileName}`, 'utf-8');
}

function assertEquals(x1: unknown, x2: unknown, message: string) {
    if (typeof x1 === 'number' && typeof x2 === 'number') {
        return assertDoubleEquals(x1, x2, message);
    }
    assert.deepStrictEqual(x1, x2, message);
}

function assertDoubleEquals(n1: number, n2: number, message: string) {
    assert.deepStrictEqual(n1.toFixed(8), n2.toFixed(8), message);
}


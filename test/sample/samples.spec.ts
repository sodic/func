import { promises as fs } from 'fs';
import assert from 'assert';
import { compileVerbose } from '../../src';
import { isFailure } from '../../src/util';
import { arrayScheme, functionScheme, tupleScheme } from '../../src/checker/inference/helpers';
import {
    BOOL_SCHEME,
    BOOL_TYPE,
    NUMBER_SCHEME,
    NUMBER_TYPE,
    STRING_SCHEME,
    STRING_TYPE,
} from '../../src/checker/types/common';
import { Scheme, showScheme } from '../../src/checker/types/scheme';
import { arrayType, functionType, tupleType, typeVar } from '../../src/checker/types/builders';
import { evaluateAndRead } from '../helpers';

const specification: TestDefinition[] = [
    {
        file: 'bare',
        expectedTypes: {
            casio1: NUMBER_SCHEME,
            casio2: NUMBER_SCHEME,
            correctAnswer: NUMBER_SCHEME,
            bare: STRING_SCHEME,
        },
        expectedValues: {
            casio1: 9,
            casio2: 1,
            correctAnswer: 1,
            bare: 'Zagradu moras prvu rijesit',
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
        file: 'geometry',
        expectedTypes: {
            pi: NUMBER_SCHEME,
            calcArea: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            calcCircumference: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            area: NUMBER_SCHEME,
            circumference: NUMBER_SCHEME,
            triangleA: arrayScheme(tupleType(NUMBER_TYPE, NUMBER_TYPE)),
            triangleB: arrayScheme(tupleType(NUMBER_TYPE, NUMBER_TYPE)),
            euclidDistance: functionScheme(
                tupleType(NUMBER_TYPE, NUMBER_TYPE),
                tupleType(NUMBER_TYPE, NUMBER_TYPE),
                NUMBER_TYPE,
            ),
            furthestFrom: functionScheme(
                tupleType(NUMBER_TYPE, NUMBER_TYPE),
                arrayType(tupleType(NUMBER_TYPE, NUMBER_TYPE)),
                tupleType(NUMBER_TYPE, NUMBER_TYPE),
            ),
            addPoints: functionScheme(
                tupleType(NUMBER_TYPE, NUMBER_TYPE),
                tupleType(NUMBER_TYPE, NUMBER_TYPE),
                tupleType(NUMBER_TYPE, NUMBER_TYPE),
            ),
            mapPair: functionScheme(
                functionType(typeVar('u1'), typeVar('u2')),
                tupleType(typeVar('u1'), typeVar('u1')),
                tupleType(typeVar('u2'), typeVar('u2')),
            ),
            centroidOf: functionScheme(
                arrayType(tupleType(NUMBER_TYPE, NUMBER_TYPE)),
                tupleType(NUMBER_TYPE, NUMBER_TYPE),
            ),
            centroidA: tupleScheme(NUMBER_TYPE, NUMBER_TYPE),
            centroidB: tupleScheme(NUMBER_TYPE, NUMBER_TYPE),
            furthestFromCenter: tupleScheme(NUMBER_TYPE, NUMBER_TYPE),
        },
        expectedValues: {
            pi: 3.14159265359,
            area: 4,
            circumference: 5,
            triangleA: [[0, 3], [7, 4], [4, 0]],
            triangleB: [[1, 1], [3, 1], [2, 3]],
            centroidA: [(7 + 4)/3, (3 + 4)/3],
            centroidB: [(1 + 3 + 2)/3, (1 + 1 + 3)/3],
            furthestFromCenter: [7, 4],
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
                functionType(typeVar('u1'), typeVar('u2'), typeVar('u3')),
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
                functionType(typeVar('u1'), typeVar('u2'), typeVar('u3')),
                typeVar('u3'),
            ),
            _first: functionScheme(
                functionType(
                    functionType(typeVar('u1'), typeVar('u2'), typeVar('u1')),
                    typeVar('u3'),
                ),
                typeVar('u3'),
            ),
            _second: functionScheme(
                functionType(
                    functionType(typeVar('u1'), typeVar('u2'), typeVar('u2')),
                    typeVar('u3'),
                ),
                typeVar('u3'),
            ),
            movie1: functionScheme(
                functionType(NUMBER_TYPE, STRING_TYPE, typeVar('u3')),
                typeVar('u3'),
            ),
            movie2: functionScheme(
                functionType(NUMBER_TYPE, STRING_TYPE, typeVar('u3')),
                typeVar('u3'),
            ),
            movie3: functionScheme(
                functionType(BOOL_TYPE, STRING_TYPE, typeVar('u3')),
                typeVar('u3'),
            ),
            movie4: functionScheme(
                functionType(STRING_TYPE, NUMBER_TYPE, typeVar('u3')),
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
            is16Prime: false,
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
            luka: tupleScheme(STRING_TYPE, NUMBER_TYPE),
            marko: tupleScheme(STRING_TYPE, NUMBER_TYPE),
            isAdult: functionScheme(
                tupleType(typeVar('u1'), NUMBER_TYPE),
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
    {
        file: 'arrays',
        expectedTypes: {
            square: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            even: functionScheme(NUMBER_TYPE, BOOL_TYPE),
            max: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            accumulate: functionScheme(
                functionType(typeVar('u1'), typeVar('u2'), typeVar('u2')),
                typeVar('u2'),
                arrayType(typeVar('u1')),
                typeVar('u2'),
            ),
            getSumOfSquares: functionScheme(arrayType(NUMBER_TYPE), NUMBER_TYPE),
            reverse1: functionScheme(arrayType(typeVar('u1')), arrayType(typeVar('u1'))),
            reverse2: functionScheme(arrayType(typeVar('u1')), arrayType(typeVar('u1'))),
            flatten1: functionScheme(
                arrayType(
                    arrayType(typeVar('u1')),
                ),
                arrayType(typeVar('u1')),
            ),
            flatten2: functionScheme(
                arrayType(
                    arrayType(typeVar('u1')),
                ),
                arrayType(typeVar('u1')),
            ),
            quicksort: functionScheme(arrayType(NUMBER_TYPE), arrayType(NUMBER_TYPE)),
            evens: arrayScheme(NUMBER_TYPE),
            odds: arrayScheme(NUMBER_TYPE),
            concatArray: arrayScheme(NUMBER_TYPE),
            spread: arrayScheme(NUMBER_TYPE),
            concatString: STRING_SCHEME,
            numbers: arrayScheme(NUMBER_TYPE),
            nested: arrayScheme(
                arrayType(
                    tupleType(NUMBER_TYPE, STRING_TYPE),
                ),
            ),
            sorted: arrayScheme(NUMBER_TYPE),
            reversed1: arrayScheme(NUMBER_TYPE),
            reversed2: arrayScheme(NUMBER_TYPE),
            flattened1: arrayScheme(
                tupleType(NUMBER_TYPE, STRING_TYPE),
            ),
            flattened2: arrayScheme(
                tupleType(NUMBER_TYPE, STRING_TYPE),
            ),
            sumOfSquares: NUMBER_SCHEME,
            largestEvenSquare: NUMBER_SCHEME,
        },
        expectedValues: {
            evens: [2, 4, 6],
            odds: [1, 3, 5],
            concatArray: [0, 2, 4, 6, 0, 1, 3, 5, 0],
            spread: [0, 2, 4, 6, 0, 1, 3, 5, 0],
            concatString: 'One, Two',
            numbers: [1, 3, 12, 4, 2, 11, 31, 7, 8],
            sorted: [1, 2, 3, 4, 7, 8, 11, 12, 31],
            reversed1: [8, 7, 31, 11, 2, 4, 12, 3, 1],
            reversed2: [8, 7, 31, 11, 2, 4, 12, 3, 1],
            flattened1: [[1, 'One'], [2, 'Two'], [3, 'Three'], [4, 'Four'], [5, 'Five'], [6, 'Six']],
            flattened2: [[1, 'One'], [2, 'Two'], [3, 'Three'], [4, 'Four'], [5, 'Five'], [6, 'Six']],
            sumOfSquares: 1369,
            largestEvenSquare: 12 * 12,
        },
    },
    {
        file: 'natives',
        expectedTypes: {
            myMap: functionScheme(
                functionType(typeVar('u1'), typeVar('u2')),
                arrayType(typeVar('u1')),
                arrayType(typeVar('u2')),
            ),
            myFilter: functionScheme(
                functionType(typeVar('u1'), BOOL_TYPE),
                arrayType(typeVar('u1')),
                arrayType(typeVar('u1')),
            ),
            myReduce: functionScheme(
                functionType(typeVar('u1'), typeVar('u2'), typeVar('u1')),
                typeVar('u1'),
                arrayType(typeVar('u2')),
                typeVar('u1'),
            ),
            myReduce0: functionScheme(
                functionType(typeVar('u1'), typeVar('u1'), typeVar('u1')),
                arrayType(typeVar('u1')),
                typeVar('u1'),
            ),
            step: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            min: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            numbers: arrayScheme(NUMBER_TYPE),
            sum: NUMBER_SCHEME,
            mySum: NUMBER_SCHEME,
            isSumOk: BOOL_SCHEME,
            product: NUMBER_SCHEME,
            myProduct: NUMBER_SCHEME,
            isProductOk: BOOL_SCHEME,
            lowestGreaterThan3: NUMBER_SCHEME,
            digitalSignal: STRING_SCHEME,
        },
        expectedValues: {
            numbers: [1.2, 2.5, 3.4, 4.3, 2.1, 1.8, 4.7],
            sum: 20,
            mySum: 20,
            isSumOk: true,
            product: 779.21676,
            myProduct: 779.21676,
            isProductOk: true,
            lowestGreaterThan3: 3.4,
            digitalSignal: '0111001',
        },
    },
    {
        file: 'lambda',
        expectedTypes: {
            mul1: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            mul2: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            sub1: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            sub2: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            mod1: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            mod2: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            samples: arrayScheme(
                tupleType(NUMBER_TYPE, NUMBER_TYPE),
            ),
            all: functionScheme(
                functionType(typeVar('u1'), BOOL_TYPE),
                arrayType(typeVar('u1')),
                BOOL_TYPE,
            ),
            areAllEqual: functionScheme(
                arrayType(NUMBER_TYPE),
                BOOL_TYPE,
            ),
            areAllTrue: functionScheme(arrayType(BOOL_TYPE), BOOL_TYPE),
            uncurry: functionScheme(
                functionType(typeVar('u1'), typeVar('u2'), typeVar('u3')),
                tupleType(typeVar('u1'), typeVar('u2')),
                typeVar('u3'),
            ),
            areFunctionsEquivalent: BOOL_SCHEME,
            conditions: arrayScheme(
                functionType(
                    tupleType(NUMBER_TYPE, NUMBER_TYPE),
                    BOOL_TYPE,
                ),
            ),
            filteredSamples: arrayScheme(
                tupleType(NUMBER_TYPE, NUMBER_TYPE),
            ),
        },
        expectedValues: {
            samples: [
                [1, 3],
                [6, 8],
                [3, 5],
                [2, 3],
                [4, 9],
                [10, 9],
                [7, 2],
                [4, 7],
            ],
            areFunctionsEquivalent: true,
            filteredSamples: [[2, 3], [4, 7]],
        },
    },
    {
        // just a speed test
        file: 'speed',
        expectedTypes: {},
        expectedValues: {},
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


import { promises as fs } from 'fs';
import assert from 'assert';
import { compileVerbose } from '../../src';
import { isFailure } from '../../src/util';
import { arrayScheme, functionScheme, tupleScheme } from '../../src/semantics/inference/helpers';
import {
    BOOL_SCHEME,
    BOOL_TYPE,
    CHARACTER_SCHEME,
    CHARACTER_TYPE,
    NUMBER_SCHEME,
    NUMBER_TYPE,
    STRING_SCHEME,
    STRING_TYPE,
} from '../../src/semantics/types/common';
import { Scheme, showScheme } from '../../src/semantics/types/scheme';
import { arrayType, functionType, tupleType, typeVar } from '../../src/semantics/types/builders';
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
            bare: 'Zagradu moras prvu rijesit'.split(''),
        },
    },
    {
        file: 'discrete',
        expectedTypes: {
            gcd: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            lcd: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            gcd_5_7: NUMBER_SCHEME,
            gcd_18_12: NUMBER_SCHEME,
            gcd_63_78: NUMBER_SCHEME,
            gcd_14288_21432: NUMBER_SCHEME,
            lcd_17_11: NUMBER_SCHEME,
            lcd_12_18: NUMBER_SCHEME,
            lcd_63_78: NUMBER_SCHEME,
            lcd_14288_21432: NUMBER_SCHEME,
            divisibleBy: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
            isLeapYear: functionScheme(NUMBER_TYPE, BOOL_TYPE),
            leap_1700: BOOL_SCHEME,
            leap_2000: BOOL_SCHEME,
            leap_2012: BOOL_SCHEME,
            leap_2016: BOOL_SCHEME,
            leap_2017: BOOL_SCHEME,
            stepRange: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE, arrayType(NUMBER_TYPE)),
            range: functionScheme(NUMBER_TYPE, NUMBER_TYPE, arrayType(NUMBER_TYPE)),
            fiveTenFifteen: arrayScheme(NUMBER_TYPE),
            multiplesOfThree: arrayScheme(NUMBER_TYPE),
            range1to10: arrayScheme(NUMBER_TYPE),
            fact: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            combinations: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            _1c0: NUMBER_SCHEME,
            _5c3: NUMBER_SCHEME,
            _12c4: NUMBER_SCHEME,
            pascalTriangle: functionScheme(
                NUMBER_TYPE,
                arrayType(arrayType(NUMBER_TYPE)),
            ),
            pascal7: arrayScheme(arrayType(NUMBER_TYPE)),
        },
        expectedValues: {
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
            fiveTenFifteen: [5, 10, 15],
            multiplesOfThree: [0,
                3, 6, 9, 12, 15, 18,
                21, 24, 27, 30, 33, 36,
                39, 42, 45, 48, 51, 54,
                57, 60, 63, 66, 69, 72,
                75, 78, 81, 84, 87, 90,
                93, 96, 99, 102,
            ],
            range1to10: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            _1c0: 1,
            _5c3: 10,
            _12c4: 495,
            pascal7: [
                [1],
                [1, 1],
                [1, 2, 1],
                [1, 3, 3, 1],
                [1, 4, 6, 4, 1],
                [1, 5, 10, 10, 5, 1],
                [1, 6, 15, 20, 15, 6, 1],
                [1, 7, 21, 35, 35, 21, 7, 1],
            ],
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
            hours: 'Hours'.split(''),
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
            luka: ['Luka'.split(''), 23],
            marko: ['Marko'.split(''), 25],
            lukaReport: 'Luka is old enough to drive'.split(''),
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
            concatString: 'One, Two'.split(''),
            numbers: [1, 3, 12, 4, 2, 11, 31, 7, 8],
            sorted: [1, 2, 3, 4, 7, 8, 11, 12, 31],
            reversed1: [8, 7, 31, 11, 2, 4, 12, 3, 1],
            reversed2: [8, 7, 31, 11, 2, 4, 12, 3, 1],
            flattened1: [[1, 'One'], [2, 'Two'], [3, 'Three'], [4, 'Four'], [5, 'Five'], [6, 'Six']]
                .map(([x, y]) => [x, (y as string).split('')]),
            flattened2: [[1, 'One'], [2, 'Two'], [3, 'Three'], [4, 'Four'], [5, 'Five'], [6, 'Six']]
                .map(([x, y]) => [x, (y as string).split('')]),
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
        file: 'intro',
        expectedTypes: {
            number1: NUMBER_SCHEME,
            number2: NUMBER_SCHEME,
            true: BOOL_SCHEME,
            char1: CHARACTER_SCHEME,
            char2: CHARACTER_SCHEME,
            char3: CHARACTER_SCHEME,
            char4: CHARACTER_SCHEME,
            char5: CHARACTER_SCHEME,
            add: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            add2: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            add3: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            next: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            two: NUMBER_SCHEME,
            five: NUMBER_SCHEME,
            square: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            negate: functionScheme(BOOL_TYPE, BOOL_TYPE),
            applyAndIncrement: functionScheme(
                functionType(typeVar('u1'), NUMBER_TYPE),
                typeVar('u1'),
                NUMBER_TYPE,
            ),
            threeSquaredPlusOne: NUMBER_SCHEME,
            apply: functionScheme(
                functionType(typeVar('u1'), typeVar('u2')),
                typeVar('u1'),
                typeVar('u2'),
            ),
            inst1: BOOL_SCHEME,
            inst2: NUMBER_SCHEME,
            inst3: functionScheme(typeVar('u1'), typeVar('u1')),
            applyTwice: functionScheme(
                functionType(typeVar('u1'), typeVar('u1')),
                typeVar('u1'),
                typeVar('u1'),
            ),
            sixteen: NUMBER_SCHEME,
            false: BOOL_SCHEME,
            max: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            stepFunction: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            shouldBe4: NUMBER_SCHEME,
            factorial: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            numberOfCombinations: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            _5c2: NUMBER_SCHEME,
            array1: arrayScheme(NUMBER_TYPE),
            array2: STRING_SCHEME,
            tuple1: tupleScheme(NUMBER_TYPE, CHARACTER_TYPE),
            tuple2: tupleScheme(NUMBER_TYPE, BOOL_TYPE, CHARACTER_TYPE),
            letterInfo: tupleScheme(CHARACTER_TYPE, NUMBER_TYPE),
            c: CHARACTER_SCHEME,
            three: NUMBER_SCHEME,
            countTo8: arrayScheme(NUMBER_TYPE),
            oneTwo: arrayScheme(NUMBER_TYPE),
            four: arrayScheme(NUMBER_TYPE),
            countTo8Alternative: arrayScheme(NUMBER_TYPE),
            name1: STRING_SCHEME,
            name2: STRING_SCHEME,
            fullName: STRING_SCHEME,
            firstElement: NUMBER_SCHEME,
            arrayWithoutTheFirstElement: arrayScheme(NUMBER_TYPE),
            isArrayEmpty: BOOL_SCHEME,
            howLongIsTheArray: NUMBER_SCHEME,
            reverse: functionScheme(
                arrayType(typeVar('u1')),
                arrayType(typeVar('u1')),
            ),
            countdownFrom8: arrayScheme(NUMBER_TYPE),
            theShinning: STRING_SCHEME,
            flatten: functionScheme(
                arrayType(arrayType(typeVar('u1'))),
                arrayType(typeVar('u1')),
            ),
            flat1: arrayScheme(NUMBER_TYPE),
            flat2: STRING_SCHEME,
            flat3: arrayScheme(tupleType(NUMBER_TYPE, STRING_TYPE)),
            flip: functionScheme(
                tupleType(typeVar('u1'), typeVar('u2')),
                tupleType(typeVar('u2'), typeVar('u1')),
            ),
            letExample1: NUMBER_SCHEME,
            letExample2: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
            weird: functionScheme(
                NUMBER_TYPE,
                functionType(NUMBER_TYPE, NUMBER_TYPE),
                NUMBER_TYPE,
            ),
            squares1To8: arrayScheme(NUMBER_TYPE),
            evens1To8: arrayScheme(NUMBER_TYPE),
            sum1To8: NUMBER_SCHEME,
            product1To8: NUMBER_SCHEME,
            sum: functionScheme(
                arrayType(NUMBER_TYPE),
                NUMBER_TYPE,
            ),
            product: functionScheme(
                arrayType(NUMBER_TYPE),
                NUMBER_TYPE,
            ),
            reverse2: functionScheme(
                arrayType(typeVar('u1')),
                arrayType(typeVar('u1')),
            ),
            flatten2: functionScheme(
                arrayType(arrayType(typeVar('u1'))),
                arrayType(typeVar('u1')),
            ),
            numbers: arrayScheme(NUMBER_TYPE),
            square1: NUMBER_SCHEME,
            square2: NUMBER_SCHEME,
            areSquaresTheSame: BOOL_SCHEME,
            f: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            g: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            h: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            c1: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            c2: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            c3: functionScheme(NUMBER_TYPE, NUMBER_TYPE),
            twentyFive: NUMBER_SCHEME,
            nine: NUMBER_SCHEME,
            thirtyFive: NUMBER_SCHEME,
            readDigit: functionScheme(NUMBER_TYPE, STRING_TYPE),
            resultComp: STRING_SCHEME,
            resultPipe: STRING_SCHEME,
            s: NUMBER_SCHEME,
            p: NUMBER_SCHEME,
            sentence: STRING_SCHEME,
            sum2: functionScheme(
                arrayType(NUMBER_TYPE),
                NUMBER_TYPE,
            ),
            product2: functionScheme(
                arrayType(NUMBER_TYPE),
                NUMBER_TYPE,
            ),
            zero: NUMBER_SCHEME,
            flatten3: functionScheme(
                arrayType(arrayType(typeVar('u1'))),
                arrayType(typeVar('u1')),
            ),
            sentence2: STRING_SCHEME,
            decimals: arrayScheme(NUMBER_TYPE),
            largerThanFive1: arrayScheme(NUMBER_TYPE),
            largerThanFive2: arrayScheme(NUMBER_TYPE),
            largerThanFive3: arrayScheme(NUMBER_TYPE),
            pipeToAll: functionScheme(
                typeVar('u1'),
                arrayType(functionType(typeVar('u1'), typeVar('u2'))),
                arrayType(typeVar('u2')),
            ),
            markoResults: arrayScheme(STRING_TYPE),
            sort: functionScheme(
                arrayType(NUMBER_TYPE),
                arrayType(NUMBER_TYPE),
            ),
            sorted: arrayScheme(NUMBER_TYPE),
        },
        expectedValues: {
            number1: 13,
            number2: 2.5e-1,
            true: true,
            char1: 'H',
            char2: 'e',
            char3: 'l',
            char4: 'l',
            char5: 'o',
            two: 2,
            five: 5,
            threeSquaredPlusOne: 10,
            inst1: true,
            inst2: 7,
            sixteen: 16,
            false: true,
            shouldBe4: 4,
            _5c2: 10,
            array1: [1, 2, 3, 4, 5],
            array2: 'Marko'.split(''),
            tuple1: [5, 'c'],
            tuple2: [1, true, '1'],
            letterInfo: ['c', 3],
            c: 'c',
            three: 3,
            countTo8: [1, 2, 3, 4, 5, 6, 7, 8],
            oneTwo: [1, 2],
            four: [4],
            countTo8Alternative: [1, 2, 3, 4, 5, 6, 7, 8],
            name1: 'Luka'.split(''),
            name2: 'Luka'.split(''),
            fullName: 'Josip Jelačić'.split(''),
            firstElement: 1,
            arrayWithoutTheFirstElement: [2, 3, 4, 5, 6, 7, 8],
            isArrayEmpty: false,
            howLongIsTheArray: 8,
            countdownFrom8: [8, 7, 6, 5, 4, 3, 2, 1],
            theShinning: 'murder'.split(''),
            flat1: [1, 2, 3, 4],
            flat2: 'Toster'.split(''),
            flat3: [[1, 'One'], [2, 'Two'], [3, 'Three'], [4, 'Four']]
                .map(([x, y]) => [x, (y as string).split('')]),
            letExample1: 9,
            squares1To8: [1, 4, 9, 16, 25, 36, 49, 64],
            evens1To8: [2, 4, 6, 8],
            sum1To8: 36,
            product1To8: 40320,
            numbers: [1, 2, 4, 11, 2, 4, 5, 7, 9, 10, 15, 13, 17, 18, 19, 6, 3],
            square1: 36,
            square2: 36,
            areSquaresTheSame: true,
            twentyFive: 25,
            nine: 9,
            thirtyFive: 35,
            resultComp: 'eerhT'.split(''),
            resultPipe: 'eerhT'.split(''),
            s: 6,
            p: 6,
            sentence: 'This is a sentence.'.split(''),
            zero: 0,
            sentence2: 'This is a sentence.'.split(''),
            decimals: [2.5, 1.7, 4.3, 6.7, 3.6, 8.3, 2.3],
            largerThanFive1: [6.7, 8.3],
            largerThanFive2: [6.7, 8.3],
            largerThanFive3: [6.7, 8.3],
            markoResults: ['okraM', 'rko', 'Marko Kutlić', 'Five'].map(x => x.split('')),
            sorted: [1.7, 2.3, 2.5, 3.6, 4.3, 6.7, 8.3],
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


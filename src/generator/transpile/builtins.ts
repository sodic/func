import { BuiltinName } from '../../builtins';
import { PropsOfType } from '../../util';
import { Identifier } from '../../ast';

/*
I can't type this as 'Record<BuiltinName, TranspileOption>' because the more general
inferred type information is required to determine 'BuiltinsTranspiledAsFunctions'.
Regardless, the presence of all builtin names as keys is ensured inside 'mapBuiltinName'.
 */
const builtinTranspileConfig = {
    [BuiltinName.Add]: binaryExpression('+'),
    [BuiltinName.Subtract]: binaryExpression('-'),
    [BuiltinName.Multiply]: binaryExpression('*'),
    [BuiltinName.Divide]: binaryExpression('/'),
    [BuiltinName.Modulus]: binaryExpression('%'),
    [BuiltinName.LessThan]: binaryExpression('<'),
    [BuiltinName.LessEqualThan]: binaryExpression('<='),
    [BuiltinName.GreaterThan]: binaryExpression('>'),
    [BuiltinName.GreaterEqualThan]: binaryExpression('>='),
    [BuiltinName.Equal]: binaryExpression('==='),
    [BuiltinName.NotEqual]: binaryExpression('!=='),
    [BuiltinName.And]: binaryExpression('&&'),
    [BuiltinName.Or]: binaryExpression('||'),
    [BuiltinName.Not]: unaryExpression('!'),
    [BuiltinName.Tuple]: functionCall('makeTuple'),
    [BuiltinName.Identity]: functionCall('id'),
    [BuiltinName.Constant]: functionCall('constant'),
    [BuiltinName.ToString]: functionCall('toString'),
    [BuiltinName.SquareRoot]: functionCall('sqrt'),
};

export type BuiltinsTranspiledAsFunctions = PropsOfType<typeof builtinTranspileConfig, TranspileAsFunction>;

export function mapBuiltinName(name: BuiltinName): string {
    return builtinTranspileConfig[name].name;
}

export function isUnaryOperator(identifier: Identifier): boolean {
    return unaryNames.has(identifier.name);
}

export function isBinaryOperator(identifier: Identifier): boolean {
    return binaryNames.has(identifier.name);
}

function getNames<T1 extends TranspileOption>(transpileOption: T1) {
    type KeyType = keyof typeof builtinTranspileConfig;
    const keys = Object.keys(builtinTranspileConfig).filter(
        key => builtinTranspileConfig[key as KeyType].transpileAs === transpileOption,
    );
    return new Set(keys);
}

export function functionCall(name: string): TranspileAsFunction {
    return {
        name,
        transpileAs: TranspileOption.FunctionCall,
    };
}

// TSNODE does not work with non-const and non-exported enums for some reason
const enum TranspileOption {
    BinaryExpression = 'BinaryExpression',
    UnaryExpression = 'UnaryExpression',
    FunctionCall = 'FunctionCall',
}

interface TranspileAsFunction {
    name: string;
    transpileAs: TranspileOption.FunctionCall;
}

interface TranspileAsUnaryExpression {
    name: string;
    transpileAs: TranspileOption.UnaryExpression;
}

interface TranpsileAsBinaryExpression {
    name: string;
    transpileAs: TranspileOption.BinaryExpression;
}

function unaryExpression(name: string): TranspileAsUnaryExpression {
    return {
        name,
        transpileAs: TranspileOption.UnaryExpression,
    };
}

function binaryExpression(name: string): TranpsileAsBinaryExpression {
    return {
        name,
        transpileAs: TranspileOption.BinaryExpression,
    };
}

const unaryNames = getNames(TranspileOption.UnaryExpression);
const binaryNames = getNames(TranspileOption.BinaryExpression);

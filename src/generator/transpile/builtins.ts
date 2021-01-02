import { BuiltinName } from '../../builtins';
import { PropsOfType } from '../../util';

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
    [BuiltinName.Tuple2]: functionCall('makeTuple2'),
    [BuiltinName.Tuple3]: functionCall('makeTuple3'),
    [BuiltinName.Tuple4]: functionCall('makeTuple4'),
    [BuiltinName.Tuple5]: functionCall('makeTuple5'),
    [BuiltinName.Compose]: functionCall('compose'),
    [BuiltinName.Pipe]: functionCall('pipe'),
    [BuiltinName.Identity]: functionCall('id'),
    [BuiltinName.Constant]: functionCall('constant'),
    [BuiltinName.ToString]: functionCall('toString'),
    [BuiltinName.SquareRoot]: functionCall('sqrt'),
    [BuiltinName.First]: functionCall('first'),
    [BuiltinName.Second]: functionCall('second'),
    [BuiltinName.ExtendArray]: functionCall('extend'),
    [BuiltinName.Head]: functionCall('head'),
    [BuiltinName.Tail]: functionCall('tail'),
    [BuiltinName.IsEmpty]: functionCall('isEmpty'),
    [BuiltinName.Concat]: functionCall('concat'),
    [BuiltinName.Map]: functionCall('map'),
    [BuiltinName.Filter]: functionCall('filter'),
    [BuiltinName.Reduce]: functionCall('reduce'),
    [BuiltinName.Reduce0]: functionCall('reduce0'),
    [BuiltinName.Join]: functionCall('join'),
    [BuiltinName.Length]: functionCall('length'),
};

export type BuiltinsTranspiledAsFunctions = PropsOfType<typeof builtinTranspileConfig, TranspileAsFunction>;

export function mapBuiltinName(name: BuiltinName): string {
    return builtinTranspileConfig[name].name;
}

export function isUnaryOperator(identifier: string): boolean {
    return unaryNames.has(identifier);
}

export function isBinaryOperator(identifier: string): boolean {
    return binaryNames.has(identifier);
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
        transpileAs: TranspileOption.FunctionCall,
        name,
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

interface TranspileAsBinaryExpression {
    name: string;
    transpileAs: TranspileOption.BinaryExpression;
}

function unaryExpression(name: string): TranspileAsUnaryExpression {
    return {
        transpileAs: TranspileOption.UnaryExpression,
        name,
    };
}

function binaryExpression(name: string): TranspileAsBinaryExpression {
    return {
        transpileAs: TranspileOption.BinaryExpression,
        name,
    };
}

const unaryNames = getNames(TranspileOption.UnaryExpression);
const binaryNames = getNames(TranspileOption.BinaryExpression);

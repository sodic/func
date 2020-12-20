import { BuiltinName, isBuiltinName } from '../../builtins';

export function validJsName(name: string | BuiltinName): string {
    if (isBuiltinName(name)) {
        return mapBuiltinName(name);
    }
    return reservedWords.has(name) ? `$$${name}` : name;
}

export function mapBuiltinName(name: BuiltinName): string {
    const builtinNameMap: Record<BuiltinName, string> = {
        [BuiltinName.Add]: '+',
        [BuiltinName.Subtract]: '-',
        [BuiltinName.Multiply]: '*',
        [BuiltinName.Divide]: '/',
        [BuiltinName.Modulus]: '%',
        [BuiltinName.LessThan]: '<',
        [BuiltinName.LessEqualThan]: '<=',
        [BuiltinName.GreaterThan]: '>',
        [BuiltinName.GreaterEqualThan]: '>=',
        [BuiltinName.Equal]: '===',
        [BuiltinName.NotEqual]: '!==',
        [BuiltinName.And]: '&&',
        [BuiltinName.Or]: '||',
        [BuiltinName.Not]: '!',
        [BuiltinName.Identity]: 'id',
        [BuiltinName.Constant]: 'constant',
        [BuiltinName.ToString]: 'toString',
        [BuiltinName.SquareRoot]: 'sqrt',
    };
    return builtinNameMap[name];
}

const keywords =[
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'export',
    'extends',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'new',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
];

const sometimesReserved = [
    'await',
    'let',
    'static',
    'yield',
];

const futureReserved = [
    'enum',
];

const futureReservedStrict =[
    'implements',
    'interface',
    'package',
    'private',
    'protected',
    'public',
];

const oldReserved =[
    'abstract',
    'boolean',
    'byte',
    'char',
    'double',
    'final',
    'float',
    'goto',
    'int',
    'long',
    'native',
    'short',
    'synchronized',
    'throws',
    'transient',
    'volatile',
];

const literals = [
    'null',
    'true',
    'false',
    'undefined',
];

const reservedWords = new Set([
    ...keywords,
    ...sometimesReserved,
    ...futureReserved,
    ...futureReservedStrict,
    ...oldReserved,
    ...literals,
]);

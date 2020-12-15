export function validJsName(name: string): string {
    return reservedWords.has(name) ? `$$${name}` : name;
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
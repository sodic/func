import { assertUnreachable, difference, mapObjectValues, union } from '../util';
import { substituteInType } from './substitution';

// τ ::= α | ι | τ → τ
export type Type = TLiteral
    | TVariable
    | TFunction
    | TArray;

export enum TypeKind {
	Variable = 'Variable',
    Boolean = 'Boolean',
    Number = 'Number',
    BigInt = 'BigInt',
    Function = 'Function',
    Array = 'Array',
}

// α (type variable)
export interface TVariable {
    kind: TypeKind.Variable;
    name: string;
}

// τ → τ (function type)
export interface TFunction {
    kind: TypeKind.Function;
    input: Type;
    output: Type;
}

export interface TArray {
   kind: TypeKind.Array;
   boxed: Type;
}

// ι (literal)
export type TLiteral = TBoolean | TBigint | TNumber;

export interface TBoolean {
    kind: TypeKind.Boolean;
}

export interface TBigint {
    kind: TypeKind.BigInt;
}

export interface TNumber {
    kind: TypeKind.Number;
}

export interface Scheme {
    bound: Set<string>;
    type: Type;
}

export type Context = { [name: string]: Scheme };

export const BIGINT_TYPE: TBigint = {
    kind: TypeKind.BigInt,
};

export const BOOL_TYPE: TBoolean = {
    kind: TypeKind.Boolean,
};

export const NUMBER_TYPE: TNumber = {
    kind: TypeKind.Number,
};

export function functionType(input: Type, output: Type): TFunction {
    return {
        input,
        output,
        kind: TypeKind.Function,
    };
}

export function curriedFunctionType(type1: Type, type2: Type, ...types: Type[]): TFunction {
    const [last1, last2, ...rest]  = [type1, type2, ...types].reverse();
    return rest.reduce(
        (acc: TFunction, type) => functionType(type, acc),
        functionType(last2, last1),
    );
}

export function arrayType(type: Type): TArray {
    return {
        kind: TypeKind.Array,
        boxed: type,
    };
}

export function typeVar(name: string): TVariable {
    return {
        kind: TypeKind.Variable,
        name,
    };
}


export function unboundScheme(type: Type): Scheme {
    return makeScheme([], type);
}

export function makeScheme(bound: string[], type: Type): Scheme {
    return {
        bound: new Set(bound),
        type,
    };
}

export function instantiate(scheme: Scheme, uniqueTypeVar: () => TVariable): Type {
    const sub = [...scheme.bound].reduce(
        (sub, oldName) => ({ ...sub, [oldName]: uniqueTypeVar() }),
        {},
    );
    return substituteInType(sub, scheme.type);
}

export function curriedFunctionScheme(type1: Type, type2: Type, ...types: Type[]): Scheme {
    return generalize({}, curriedFunctionType(type1, type2, ...types));
}

export function generalize(context: Context, type: Type): Scheme {
    const freeVars = difference(freeTypeVars(type), freeTypeVarsContext(context));
    return humanFriendlyScheme({
        bound: freeVars,
        type,
    });
}

/**
 * Renames the scheme's type variables to be more human friendly
 */
type TVarSubstitution = { [name: string]: TVariable };
export function humanFriendlyScheme(scheme: Scheme): Scheme {
    const newTypeVar = typeVarGenerator();
    const renaming: TVarSubstitution = [...scheme.bound].reduce(
        (acc, varName) => ({ ...acc, [varName]: newTypeVar() }),
        {},
    );
    return {
        bound: new Set([...scheme.bound].map(varName => renaming[varName].name)),
        type: substituteInType(renaming, scheme.type),
    };
}

export function showScheme(scheme: Scheme): string {
    const typeString = showType(scheme.type);
    return scheme.bound.size ? `forall ${[...scheme.bound].join(', ')}: ${typeString}` : typeString;
}

export function showContext(context: Context): string {
    return JSON.stringify(mapObjectValues(context, showScheme));
}

export function showType(type: Type): string {
    switch (type.kind) {
    case TypeKind.Number:
        return 'Number';
    case TypeKind.Boolean:
        return 'Boolean';
    case TypeKind.BigInt:
        return 'Bigint';
    case TypeKind.Function:
        return showFunction(type);
    case TypeKind.Variable:
        return type.name;
    case TypeKind.Array:
        return `${showType(type.boxed)}[]`;
    default:
        assertUnreachable(type);
    }
}

function showFunction(type: TFunction): string  {
    const { input, output } = type;
    const inputStr = input.kind === TypeKind.Function ? `(${showType(input)})` : `${showType(input)}` ;
    return `${inputStr} -> ${showType(output)}`;
}

export function typeVarGenerator(): () => TVariable {
    let current = 0;

    return function newTypeVar(): TVariable {
        current += 1;
        return typeVar(`t${current}`);
    };
}

export function freeTypeVars(type: Type): Set<string> {
    switch (type.kind) {
    case TypeKind.Variable:
        return new Set([type.name]);
    case TypeKind.Function:
        return union(freeTypeVars(type.input), freeTypeVars(type.output));
    default:
        return new Set();
    }
}

function freeTypeVarsScheme(scheme: Scheme): Set<string> {
    return difference(freeTypeVars(scheme.type), new Set(scheme.bound));
}

function freeTypeVarsContext(context: Context): Set<string> {
    return Object.values(context)
        .map(freeTypeVarsScheme)
        .reduce(union, new Set());
}

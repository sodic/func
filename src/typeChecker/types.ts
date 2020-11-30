import { assertUnreachable, difference, union } from '../util';
import { substituteInType } from './substitution';

// τ ::= α | ι | τ → τ
export type Type = TLiteral
    | TVariable
    | TFunction
    | TArray;

export enum TypeKind {
	Variable,
    Boolean,
    Number,
    BigInt,
    Function,
    Array,
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
    return {
        bound: new Set(),
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

export function generalize(context: Context, type: Type): Scheme {
    const freeVars = difference(freeTypeVars(type), freeTypeVarsContext(context));
    return {
        bound: freeVars,
        type: type,
    };

}

export function show(type: Type): string {
    switch (type.kind) {
    case TypeKind.Number:
        return 'Number';
    case TypeKind.Boolean:
        return 'Boolean';
    case TypeKind.BigInt:
        return 'Bigint';
    case TypeKind.Function:
        return `${show(type.input)} -> ${show(type.output)}`;
    case TypeKind.Variable:
        return type.name;
    case TypeKind.Array:
        return `${show(type.boxed)}[]`;
    default:
        assertUnreachable(type);
    }
}

export function typeVarGenerator(): () => TVariable {
    let current = -1;

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
        .reduce(union);
}

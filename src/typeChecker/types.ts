import { assertUnreachable, difference, union } from './primitives';
import { substituteInType } from './substitution';

// τ ::= α | ι | τ → τ
export type Type = TLiteral
	| TVariable
	| TFunction
    | TArray;


// α (type variable)
export interface TVariable {
	kind: 'variable';
	name: string;
}

// τ → τ (function type)
export interface TFunction {
	kind: 'function';
	input: Type;
	output: Type;
}

export interface TArray {
   kind: 'array';
   boxed: Type;
}

// ι (literal)
export type TLiteral = TBoolean | TBigint | TNumber;

export interface TBoolean {
	kind: 'boolean';
}

export interface TBigint {
	kind: 'bigint';
}

export interface TNumber {
    kind: 'number';
}

export interface Scheme {
	bound: Set<string>;
	type: Type;
}

export type Context = { [name: string]: Scheme };

export const BIGINT_TYPE: TBigint = {
    kind: 'bigint',
};

export const BOOL_TYPE: TBoolean = {
    kind: 'boolean',
};

export const NUMBER_TYPE: TNumber = {
    kind: 'number',
};

export function functionType(input: Type, output: Type): TFunction {
    return {
        input,
        output,
        kind: 'function',
    };
}

export function arrayType(type: Type): TArray {
    return {
        kind: 'array',
        boxed: type,
    };
}

export function typeVar(name: string): TVariable {
    return {
        name,
        kind: 'variable',
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
    case 'number':
        return 'Number';
    case 'boolean':
        return 'Boolean';
    case 'bigint':
        return 'Bigint';
    case 'function':
        return `${show(type.input)} -> ${show(type.output)}`;
    case 'variable':
        return type.name;
    case 'array':
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
    case 'variable':
        return new Set([type.name]);
    case 'function':
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

import { assertUnreachable, difference, union } from './primitives';
import { substituteInType } from './substitution';

// τ ::= α | ι | τ → τ
export type Type = TLiteral
	| TVariable
	| TFunction;


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

// ι (literal)
export type TLiteral = TBoolean | TInt;

export interface TBoolean {
	kind: 'boolean';
}

export interface TInt {
	kind: 'int';
}

export interface Scheme {
	bound: Set<string>;
	type: Type;
}

export type Context = { [name: string]: Scheme };

export const INT_TYPE: TInt = {
    kind: 'int',
};

export const BOOL_TYPE: TBoolean = {
    kind: 'boolean',
};

export function functionType(input: Type, output: Type): TFunction {
    return {
        input,
        output,
        kind: 'function',
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
    case 'int':
        return 'Int';
    case 'boolean':
        return 'Boolean';
    case 'function':
        return `${show(type.input)} -> ${show(type.output)}`;
    case 'variable':
        return type.name;
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

import { showType, Type, TypeKind } from './types/type';
import { composeSubstitutions, substituteInType, Substitution } from './substitution';
import { freeTypeVars } from './types/builders';

export class UnificationError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class OccursError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export function unify(t1: Type, t2: Type): Substitution {
    if (t1.kind === TypeKind.Number && t2.kind === TypeKind.Number) {
        return {};
    } else if (t1.kind === TypeKind.Boolean && t2.kind === TypeKind.Boolean) {
        return {};
    } else if (t1.kind === TypeKind.BigInt && t2.kind === TypeKind.BigInt) {
        return {};
    } else if (t1.kind === TypeKind.Function && t2.kind === TypeKind.Function) {
        const s1 = unify(t1.input, t2.input);
        const s2 = unify(substituteInType(s1, t1.output), substituteInType(s1, t2.output));
        return composeSubstitutions(s1, s2);
    } else if (t1.kind === TypeKind.Array && t2.kind === TypeKind.Array) {
        return unify(t1.boxed, t2.boxed);
    } else if (t1.kind === TypeKind.Variable) {
        return bindToVar(t1.name, t2);
    } else if (t2.kind === TypeKind.Variable) {
        return bindToVar(t2.name, t1);
    } else {
        throw new UnificationError(`Cannot unify ${showType(t1)} with ${showType(t2)}`);
    }
}

function bindToVar(typeVarName: string, type: Type): Substitution {
    if (type.kind === TypeKind.Variable && typeVarName === type.name) {
        return {};
    } else if (freeTypeVars(type).has(typeVarName)) {
        throw new OccursError(`Occurs check failed: ${typeVarName} appears in ${showType(type)}`);
    } else {
        return { [typeVarName]: type };
    }
}

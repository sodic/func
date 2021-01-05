import { showType, Type, TypeKind } from './types/type';
import { composeSubstitutions, EMPTY_SUBSTITUTION, substituteInType, Substitution } from './substitution';
import { freeTypeVars } from './types/builders';
import { zip } from '../util';


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
        return EMPTY_SUBSTITUTION;

    } else if (t1.kind === TypeKind.Boolean && t2.kind === TypeKind.Boolean) {
        return EMPTY_SUBSTITUTION;

    } else if (t1.kind === TypeKind.BigInt && t2.kind === TypeKind.BigInt) {
        return EMPTY_SUBSTITUTION;

    } else if (t1.kind === TypeKind.String && t2.kind === TypeKind.String) {
        return EMPTY_SUBSTITUTION;

    } else if (t1.kind === TypeKind.Variable) {
        return bindToVar(t1.name, t2);

    } else if (t2.kind === TypeKind.Variable) {
        return bindToVar(t2.name, t1);

    } else if (t1.kind === TypeKind.Function && t2.kind === TypeKind.Function) {
        const s1 = unify(t1.input, t2.input);
        const s2 = unify(substituteInType(s1, t1.output), substituteInType(s1, t2.output));
        return composeSubstitutions(s1, s2);

    } else if (
        t1.kind === TypeKind.Polymorphic && t2.kind === TypeKind.Polymorphic
        && t1.constructor === t2.constructor
    ) {
        return reduceUnify(t1.parameters, t2.parameters);

    } else {
        throw new UnificationError(`Type Error: Cannot unify types "${showType(t1)}" and "${showType(t2)}"`);
    }
}

function bindToVar(typeVarName: string, type: Type): Substitution {
    if (type.kind === TypeKind.Variable && typeVarName === type.name) {
        return EMPTY_SUBSTITUTION;
    } else if (freeTypeVars(type).has(typeVarName)) {
        throw new OccursError(`Type Error: Occurs check failed, "${typeVarName}" appears in "${showType(type)}"`);
    } else {
        return { [typeVarName]: type };
    }
}

function reduceUnify(types1: Type[], types2: Type[]): Substitution {
    const zippedTypes = zip(types1, types2);
    return zippedTypes.reduce(
        (acc: Substitution, [type1, type2]) => composeSubstitutions(
            acc,
            unify(substituteInType(acc, type1), substituteInType(acc, type2)),
        ),
        EMPTY_SUBSTITUTION,
    );
}

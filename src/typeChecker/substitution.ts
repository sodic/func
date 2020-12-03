import { arrayType, Context, functionType, Scheme, Type, TypeKind } from './types';
import { assertUnreachable, mapObjectValues } from '../util';

export type Substitution = { [variableName: string]: Type };

export function substituteInType(sub: Substitution, type: Type): Type {
    switch (type.kind) {
    case TypeKind.Function:
        return functionType(
            substituteInType(sub, type.input),
            substituteInType(sub, type.output),
        );
    case TypeKind.Variable:
        return sub[type.name] ?? type;
    case TypeKind.Number:
        return type;
    case TypeKind.Boolean:
        return type;
    case TypeKind.BigInt:
        return type;
    case TypeKind.Array:
        return arrayType(substituteInType(sub, type.boxed));
    default:
        assertUnreachable(type);
    }
}

export function substituteInContext(sub: Substitution, context: Context): Context {
    const substitute = (scheme: Scheme) => substituteInScheme(sub, scheme);
    return mapObjectValues(context, substitute);
}

export function composeSubstitutions(...subs: Substitution[]): Substitution {
    return subs.reduce(
        (composition, sub) => ({
            ...mapObjectValues(composition, type => substituteInType(sub, type)),
            ...sub,
        }),
        {},
    );
}

export function substituteInScheme(sub: Substitution, scheme: Scheme): Scheme {
    const cleanedSub = Object.keys(sub)
        .filter(typeVarName => !scheme.bound.has(typeVarName))
        .reduce(
            (clean, currentKey) => ({
                ...clean,
                [currentKey]: sub[currentKey],
            }),
            {},
        );
    return {
        bound: scheme.bound,
        type: substituteInType(cleanedSub, scheme.type),
    };
}

import { TFunction, TPolymorphic, TVariable, Type, TypeKind } from './type';
import { union } from '../../util';
import { Scheme } from './scheme';

export function typeVar(name: string): TVariable {
    return {
        kind: TypeKind.Variable,
        name,
    };
}

export function functionType(input: Type, output: Type): TFunction {
    return {
        kind: TypeKind.Function,
        input,
        output,
    };
}

export function curriedFunctionType(type1: Type, type2: Type, ...types: Type[]): TFunction {
    const [last1, last2, ...rest] = [type1, type2, ...types].reverse();
    return rest.reduce(
        (acc: TFunction, type) => functionType(type, acc),
        functionType(last2, last1),
    );
}

export function polymorphicType(constructor: string, parameters: Type[]): TPolymorphic {
    return {
        kind: TypeKind.Polymorphic,
        constructor,
        parameters,
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

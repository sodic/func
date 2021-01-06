import { assertUnreachable } from '../../util';

// τ ::= α | ι | τ → τ
export type Type = TLiteral
    | TVariable
    | TFunction
    | TPolymorphic;

export enum TypeKind {
    Variable = 'Variable',
    Boolean = 'Boolean',
    Number = 'Number',
    BigInt = 'BigInt',
    Character = 'Character',
    Function = 'Function',
    Polymorphic = 'Polymorphic',
}

export const Constructor = {
    Tuple: {
        2: '2-tuple',
        3: '3-tuple',
        4: '4-tuple',
        5: '5-tuple',
        6: '6-tuple',
    },
    Array: 'Array',
};

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

export interface TPolymorphic {
   kind: TypeKind.Polymorphic;
   constructor: string;
   parameters: Type[];
}

// ι (literal)
export type TLiteral = TBoolean
    | TBigint
    | TNumber
    | TCharacter;

export interface TBoolean {
    kind: TypeKind.Boolean;
}

export interface TBigint {
    kind: TypeKind.BigInt;
}

export interface TNumber {
    kind: TypeKind.Number;
}

export interface TCharacter {
    kind: TypeKind.Character;
}

export function showType(type: Type): string {
    switch (type.kind) {
    case TypeKind.Number:
        return 'Number';
    case TypeKind.Boolean:
        return 'Bool';
    case TypeKind.Character:
        return 'Char';
    case TypeKind.BigInt:
        return 'Bigint';
    case TypeKind.Function:
        return showFunction(type);
    case TypeKind.Variable:
        return type.name;
    case TypeKind.Polymorphic:
        return showPolymorphicType(type);
    default:
        assertUnreachable(type);
    }
}

function isTuple(type: TPolymorphic): boolean {
    return Object.values(Constructor.Tuple).includes(type.constructor);
}

function showPolymorphicType(type: TPolymorphic) {
    const paramTypes = type.parameters.map(showType);
    if (isTuple(type)) {
        return `(${paramTypes.join(', ')})`;
    } else if (type.constructor == Constructor.Array) {
        return `[${showType(type.parameters[0])}]`;
    } else {
        return `${type.constructor} ${paramTypes.join(', ')})`;
    }
}

function showFunction(type: TFunction): string  {
    const { input, output } = type;
    const inputStr = input.kind === TypeKind.Function ? `(${showType(input)})` : `${showType(input)}` ;
    return `${inputStr} -> ${showType(output)}`;
}


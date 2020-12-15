import { assertUnreachable } from '../../util';

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
    String = 'String',
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
export type TLiteral = TBoolean
    | TBigint
    | TNumber
    | TString;

export interface TBoolean {
    kind: TypeKind.Boolean;
}

export interface TBigint {
    kind: TypeKind.BigInt;
}

export interface TNumber {
    kind: TypeKind.Number;
}

export interface TString {
    kind: TypeKind.String;
}

export function showType(type: Type): string {
    switch (type.kind) {
    case TypeKind.Number:
        return 'Number';
    case TypeKind.Boolean:
        return 'Boolean';
    case TypeKind.BigInt:
        return 'Bigint';
    case TypeKind.String:
        return 'String';
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


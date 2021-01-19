import { TBigint, TBoolean, TCharacter, TNumber, TPolymorphic, TypeKind } from './type';
import { Scheme } from './scheme';
import { arrayType, unboundScheme } from './builders';

export const NUMBER_TYPE: TNumber = {
    kind: TypeKind.Number,
};

export const BOOL_TYPE: TBoolean = {
    kind: TypeKind.Boolean,
};

export const CHARACTER_TYPE: TCharacter = {
    kind: TypeKind.Character,
};

export const STRING_TYPE: TPolymorphic = arrayType(CHARACTER_TYPE);

export const BIGINT_TYPE: TBigint = {
    kind: TypeKind.BigInt,
};

// todo see if making type a kind of scheme would make things easier
// Scheme = Type | { bound: Set<string>; type: Type }

export const NUMBER_SCHEME: Scheme = unboundScheme(NUMBER_TYPE);

export const BOOL_SCHEME: Scheme = unboundScheme(BOOL_TYPE);

export const CHARACTER_SCHEME: Scheme = unboundScheme(CHARACTER_TYPE);

export const STRING_SCHEME: Scheme = unboundScheme(STRING_TYPE);

export const BIGINT_SCHEME: Scheme = unboundScheme(BIGINT_TYPE);

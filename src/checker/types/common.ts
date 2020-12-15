import { TBigint, TBoolean, TNumber, TString, TypeKind } from './type';

export const NUMBER_TYPE: TNumber = {
    kind: TypeKind.Number,
};

export const BOOL_TYPE: TBoolean = {
    kind: TypeKind.Boolean,
};

export const STRING_TYPE: TString = {
    kind: TypeKind.String,
};

export const BIGINT_TYPE: TBigint = {
    kind: TypeKind.BigInt,
};

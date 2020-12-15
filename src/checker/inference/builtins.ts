import { BuiltinName } from '../../builtins';
import { BOOL_TYPE, NUMBER_TYPE, STRING_TYPE } from '../types/common';
import { typeVar } from '../types/builders';
import { Scheme } from '../types/scheme';
import { functionScheme } from './helpers';

export const builtins: Record<BuiltinName, Scheme> = {
    [BuiltinName.Add]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinName.Subtract]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinName.Multiply]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinName.Divide]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinName.Modulus]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinName.LessThan]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinName.LessEqualThan]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinName.GreaterThan]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinName.GreaterEqualThan]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    // todo solve this with type classes (they could be boolean, could be strings)
    [BuiltinName.Equal]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinName.NotEqual]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinName.And]: functionScheme(BOOL_TYPE, BOOL_TYPE, BOOL_TYPE),
    [BuiltinName.Or]: functionScheme(BOOL_TYPE, BOOL_TYPE, BOOL_TYPE),
    [BuiltinName.Identity]: functionScheme(typeVar('u1'), typeVar('u1')),
    [BuiltinName.Constant]: functionScheme(typeVar('u1'), typeVar('u2'), typeVar('u1')),
    [BuiltinName.ToString]: functionScheme(typeVar('u1'), STRING_TYPE),
};
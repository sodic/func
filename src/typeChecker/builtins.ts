import {
    BOOL_TYPE, 
    functionScheme,
    NUMBER_TYPE,
    Scheme,
    typeVar,
} from './types';
import { Builtin, BuiltinFunction, BuiltinOperator } from '../builtins';

export const builtins: Record<Builtin, Scheme> = {
    [BuiltinOperator.Add]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinOperator.Subtract]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinOperator.Multiply]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinOperator.Divide]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinOperator.Modulus]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinOperator.LessThan]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinOperator.LessEqualThan]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinOperator.GreaterThan]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinOperator.GreaterEqualThan]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinOperator.Equal]: functionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinFunction.Identity]: functionScheme(typeVar('u1'), typeVar('u1')),
    [BuiltinFunction.Constant]: functionScheme(typeVar('u1'), typeVar('u2'), typeVar('u1')),
};
import {
    BOOL_TYPE, curriedFunctionScheme,
    NUMBER_TYPE,
    Scheme,
    typeVar,
} from './types';
import { Builtin, BuiltinFunction, BuiltinOperator } from '../builtins';

export const builtins: Record<Builtin, Scheme> = {
    [BuiltinOperator.Add]: curriedFunctionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinOperator.Subtract]: curriedFunctionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinOperator.Multiply]: curriedFunctionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinOperator.Divide]: curriedFunctionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinOperator.Modulus]: curriedFunctionScheme(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE),
    [BuiltinOperator.LessThan]: curriedFunctionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinOperator.LessEqualThan]: curriedFunctionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinOperator.GreaterThan]: curriedFunctionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinOperator.GreaterEqualThan]: curriedFunctionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinOperator.Equal]: curriedFunctionScheme(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE),
    [BuiltinFunction.Identity]: curriedFunctionScheme(typeVar('u1'), typeVar('u1')),
    [BuiltinFunction.Constant]: curriedFunctionScheme( typeVar('u1'), typeVar('u2'), typeVar('u1')),
};
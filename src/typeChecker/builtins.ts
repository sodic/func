import {
    BOOL_TYPE,
    curriedFunctionType,
    functionType,
    makeScheme,
    NUMBER_TYPE, Scheme,
    typeVar,
    unboundScheme,
} from './types';
import { Builtin, BuiltinFunction, BuiltinOperator } from '../builtins';

export const builtins: Record<Builtin, Scheme> = {
    [BuiltinOperator.Add]: unboundScheme(curriedFunctionType(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE)),
    [BuiltinOperator.Subtract]: unboundScheme(curriedFunctionType(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE)),
    [BuiltinOperator.Multiply]: unboundScheme(curriedFunctionType(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE)),
    [BuiltinOperator.Divide]: unboundScheme(curriedFunctionType(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE)),
    [BuiltinOperator.Modulus]: unboundScheme(curriedFunctionType(NUMBER_TYPE, NUMBER_TYPE, NUMBER_TYPE)),
    [BuiltinOperator.LessThan]: unboundScheme(curriedFunctionType(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE)),
    [BuiltinOperator.LessEqualThan]: unboundScheme(curriedFunctionType(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE)),
    [BuiltinOperator.GreaterThan]: unboundScheme(curriedFunctionType(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE)),
    [BuiltinOperator.GreaterEqualThan]: unboundScheme(curriedFunctionType(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE)),
    [BuiltinOperator.Equal]: unboundScheme(curriedFunctionType(NUMBER_TYPE, NUMBER_TYPE, BOOL_TYPE)),
    [BuiltinFunction.Identity]: makeScheme(['u1'], functionType(typeVar('u1'), typeVar('u1'))),
    [BuiltinFunction.Constant]: makeScheme(
        ['u1', 'u2'],
        curriedFunctionType(
            typeVar('u1'),
            typeVar('u2'),
            typeVar('u1'),
        ),
    ),
};
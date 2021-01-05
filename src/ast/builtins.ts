import { BuiltinName } from '../builtins';
import { makeIdentifierReference } from './builders';
import { Identifier } from './expressions';

/**
 * A Record providing an AST node for a builtin function/operator.
 */
export const Builtin = Object.entries(BuiltinName).reduce(
    (acc, [name, code]) => ({
        ...acc,
        [name]: makeIdentifierReference(code),
    }),
    {},
) as Record<keyof typeof BuiltinName, Identifier>;

// todo make a for loop after separating operators from functions
// todo add missing because of parsing problems (tuples, and, or)
export const bindableBinaryOperators = [
    Builtin.Add,
    Builtin.Subtract,
    Builtin.Multiply,
    Builtin.Divide,
    Builtin.Modulus,
    Builtin.LessThan,
    Builtin.LessEqualThan,
    Builtin.GreaterThan,
    Builtin.GreaterEqualThan,
    Builtin.Equal,
    Builtin.NotEqual,
    Builtin.And,
    Builtin.Or,
    Builtin.Compose,
    Builtin.Pipe,
];

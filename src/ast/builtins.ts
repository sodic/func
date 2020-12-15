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

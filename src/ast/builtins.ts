import { BuiltinName } from '../builtins';
import { makeIdentifierReference } from './builders';
import { Identifier } from './expressions';

export const Operator = Object.entries(BuiltinName).reduce(
    (acc, [name, code]) => ({
        ...acc,
        [name]: makeIdentifierReference(code),
    }),
    {},
) as Record<keyof typeof BuiltinName, Identifier>;
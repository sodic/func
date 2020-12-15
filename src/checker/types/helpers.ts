import { Scheme } from './scheme';
import { difference, union } from '../../util';
import { freeTypeVars } from './builders';
import { Context } from './context';

function freeTypeVarsScheme(scheme: Scheme): Set<string> {
    return difference(freeTypeVars(scheme.type), new Set(scheme.bound));
}

export function freeTypeVarsContext(context: Context): Set<string> {
    return Object.values(context)
        .map(freeTypeVarsScheme)
        .reduce(union, new Set());
}

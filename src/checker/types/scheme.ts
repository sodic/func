import { showType, Type } from './type';

export interface Scheme {
    bound: Set<string>;
    type: Type;
}

export function showScheme(scheme: Scheme, showQuantifiers = false): string {
    const typeString = showType(scheme.type);
    const prefix = `∀${[...scheme.bound].join(',')}: `;
    return scheme.bound.size  && showQuantifiers ? `${prefix}${typeString}` : typeString;
}

import { showType, Type } from './type';

export interface Scheme {
	bound: Set<string>;
	type: Type;
}

export function showScheme(scheme: Scheme): string {
    const typeString = showType(scheme.type);
    return scheme.bound.size ? `forall ${[...scheme.bound].join(', ')}: ${typeString}` : typeString;
}

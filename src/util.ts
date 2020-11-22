export function mapObjectValues<T, U>(object: {[key: string]: T}, map: (value: T) => U): {[key: string]: U} {
    return Object.entries(object).reduce(
        (result, [key, value]) => ({ ...result, [key]: map(value) }),
        {},
    );
}

export function union<T>(s1: Set<T>, s2: Set<T>): Set<T> {
    return new Set([...s1, ...s2]);
}

export function difference<T>(s1: Set<T>, s2: Set<T>): Set<T> {
    return new Set([...s1].filter(el => !s2.has(el)));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertUnreachable(x: never): never {
    throw Error('This code should be unreachable');
}
export function mapObjectValues<T, U>(object: {[key: string]: T}, map: (value: T) => U): {[key: string]: U} {
    return Object.entries(object).reduce(
        (result, [key, value]) => ({ ...result, [key]: map(value) }),
        {},
    );
}

// todo figure out how to make this more clever (variadic arrays with correct types)
export function zip<T, U>(xs: T[], ys: U[]): [T, U][] {
    const limit = Math.min(xs.length, ys.length);
    return xs.slice(0, limit).map((x, i) => [x, ys[i]]);
}

export function range(start: number, end: number): number[] {
    if (end <= start) {
        return [];
    } else {
        return [...Array(end - start).keys()].map(index => index + start);
    }
}

export function union<T>(s1: Set<T>, s2: Set<T>): Set<T> {
    return new Set([...s1, ...s2]);
}

export function difference<T>(s1: Set<T>, s2: Set<T>): Set<T> {
    return new Set([...s1].filter(el => !s2.has(el)));
}

/**
 * Used purely to help compiler check for exhaustiveness in switch statements,
 * will never execute. See https://stackoverflow.com/a/39419171.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertUnreachable(x: never): never {
    throw Error('This code should be unreachable');
}

export type NonEmpty<TArray extends unknown[]> = TArray extends Array<infer TEntry> ? [TEntry, ...TArray] : never;

/**
 * Property keys of an object of type TObject with values of type TType
 */
export type PropsOfType<TObject, TType> = {
    [K in keyof TObject]: TObject[K] extends TType ? K : never;
}[keyof TObject];

/**
 * Constructs a union type for arrays holding type values of type 'TValue' with a fixed length
 * of 'TType'.
 */
export type TupleOf<TValue, TSize extends number> = TSize extends TSize
    ?  _TupleOf<TValue, TSize, []> : never;

type _TupleOf<TValue, TSize extends number, R extends unknown[]> = R['length'] extends TSize
    ? R : _TupleOf<TValue, TSize, [TValue, ...R]>;

/**
 * Similar semantics as in Rust and Swift.
 */
export type Result<Value, Error> = Success<Value> | Failure<Error>;

export function isFailure<TError>(result: Result<unknown, TError>): result is Failure<TError> {
    return result.kind === ResultKind.Failure;
}

export function isSuccess<TValue>(result: Result<TValue, unknown>): result is Success<TValue> {
    return result.kind === ResultKind.Success;
}

export function success<TValue>(value: TValue): Success<TValue> {
    return {
        kind: ResultKind.Success,
        value,
    };
}

export function failure<TError>(error: TError): Failure<TError> {
    return {
        kind: ResultKind.Failure,
        error,
    };
}

type Success<Value> = {
    kind: ResultKind.Success;
    value: Value;
};

type Failure<Error> = {
    kind: ResultKind.Failure;
    error: Error;
};

enum ResultKind {
    Success = 'Success',
    Failure = 'Failure',
}

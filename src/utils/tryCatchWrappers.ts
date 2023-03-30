type ResultTuple<T> = [Error | null, T | null];

export function tryCatchAsync<T extends unknown[], U>(
    fn: (...args: T) => Promise<U>
): (...args: T) => Promise<ResultTuple<U>> {
    return async function (...args: T): Promise<ResultTuple<U>> {
        try {
            const data = await fn(...args);
            return [null, data] as ResultTuple<U>;
        } catch (err) {
            return [err as Error, null] as ResultTuple<U>;
        }
    };
}

export function tryCatchSync<T extends unknown[], U>(
    fn: (...args: T) => U
): (...args: T) => ResultTuple<U> {
    return function (...args: T): ResultTuple<U> {
        try {
            const data = fn(...args);
            return [null, data] as ResultTuple<U>;
        } catch (err) {
            return [err as Error, null] as ResultTuple<U>;
        }
    };
}

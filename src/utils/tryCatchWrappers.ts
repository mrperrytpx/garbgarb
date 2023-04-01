import { ApiError } from "next/dist/server/api-utils";

type AsyncResultTuple<T> = [ApiError | null, T | null];
type SyncResultTuple<T> = [Error | null, T | null];

export function tryCatchAsync<T extends unknown[], U>(
    fn: (...args: T) => Promise<U>
): (...args: T) => Promise<AsyncResultTuple<U>> {
    return async function (...args: T): Promise<AsyncResultTuple<U>> {
        try {
            const data = await fn(...args);
            return [null, data] as AsyncResultTuple<U>;
        } catch (err) {
            return [err as ApiError, null] as AsyncResultTuple<U>;
        }
    };
}

export function tryCatchSync<T extends unknown[], U>(
    fn: (...args: T) => U
): (...args: T) => SyncResultTuple<U> {
    return function (...args: T): SyncResultTuple<U> {
        try {
            const data = fn(...args);
            return [null, data] as SyncResultTuple<U>;
        } catch (err) {
            return [err as Error, null] as SyncResultTuple<U>;
        }
    };
}

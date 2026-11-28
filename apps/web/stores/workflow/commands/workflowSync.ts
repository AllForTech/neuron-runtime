import {
  AUTOSAVE_DEBOUNCE_MS,
  CONTEXT_TO_LOCAL_SYNC_MS,
  GRAPH_DEBOUNCE_MS,
  LOCAL_TO_CONTEXT_DEBOUNCE_MS,
  RETRY_ATTEMPTS,
  RETRY_DELAYS_MS,
} from '../constants';

/** Injected timers keep the scheduler testable without React or fake globals. */
export interface TimerFunctions {
  setTimeout(callback: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
}

export interface Debounced<TArgs extends unknown[]> {
  (...args: TArgs): void;
  cancel(): void;
  flush(): void;
}

export function createDebounced<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  waitMs: number,
  timers: TimerFunctions
): Debounced<TArgs> {
  let handle: unknown = null;
  let pendingArgs: TArgs | null = null;

  const debounced = ((...args: TArgs) => {
    pendingArgs = args;
    if (handle !== null) timers.clearTimeout(handle);
    handle = timers.setTimeout(() => {
      handle = null;
      const argsToApply = pendingArgs;
      pendingArgs = null;
      if (argsToApply) fn(...argsToApply);
    }, waitMs);
  }) as Debounced<TArgs>;

  debounced.cancel = () => {
    if (handle !== null) timers.clearTimeout(handle);
    handle = null;
    pendingArgs = null;
  };

  debounced.flush = () => {
    if (handle !== null) timers.clearTimeout(handle);
    handle = null;
    const argsToApply = pendingArgs;
    pendingArgs = null;
    if (argsToApply) fn(...argsToApply);
  };

  return debounced;
}

/**
 * Delay before retry number `attempt` (1-based). Returns null once the five
 * configured retries are exhausted.
 */
export function retryDelayFor(attempt: number): number | null {
  if (!Number.isInteger(attempt) || attempt < 1 || attempt > RETRY_ATTEMPTS) {
    return null;
  }
  return RETRY_DELAYS_MS[attempt - 1] ?? null;
}

export interface RetryOptions<T> {
  maxAttempts?: number;
  delaysMs?: readonly number[];
  sleep?: (ms: number) => Promise<void>;
  onAttemptError?: (error: unknown, attempt: number) => void;
}

export interface RetryResult<T> {
  ok: boolean;
  attempts: number;
  value?: T;
  error?: unknown;
}

/** First attempt plus at most `maxAttempts` retries with the pinned backoff. */
export async function runWithRetry<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions<T> = {}
): Promise<RetryResult<T>> {
  const maxAttempts = options.maxAttempts ?? RETRY_ATTEMPTS;
  const delays = options.delaysMs ?? RETRY_DELAYS_MS;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxAttempts; attempt += 1) {
    try {	
      const value = await operation(attempt);
      return { ok: true, attempts: attempt + 1, value };
    } catch (error) {
      lastError = error;
      options.onAttemptError?.(error, attempt);
      if (attempt === maxAttempts) break;
      const delay = delays[attempt] ?? null;
      if (delay === null) break;
      await sleep(delay);
    }
  }

  return { ok: false, attempts: maxAttempts + 1, error: lastError };
}

/** All four editor debounce/sync boundaries are created from one policy. */
export function createGraphSyncTimers(timers: TimerFunctions) {
  return {
    localToContext: (update: () => void) =>
      createDebounced(update, LOCAL_TO_CONTEXT_DEBOUNCE_MS, timers),
    contextToLocal: (sync: () => void) =>
      createDebounced(sync, CONTEXT_TO_LOCAL_SYNC_MS, timers),
    edgeAdd: (add: () => void) =>
      createDebounced(add, GRAPH_DEBOUNCE_MS, timers),
    autosave: (save: () => void | Promise<void>) =>
      createDebounced(() => void save(), AUTOSAVE_DEBOUNCE_MS, timers),
  };
}

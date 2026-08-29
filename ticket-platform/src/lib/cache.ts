type CacheEntry<T> = { value: T; expiresAt: number; refreshedAt: number };

const DEFAULT_TTL_MS = 30_000;

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export function setCache<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
  const now = Date.now();
  cache.set(key, { value, expiresAt: now + ttlMs, refreshedAt: now });
}

export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS
): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) {
    if (hit.refreshedAt < now - ttlMs / 2) {
      refresh(key, fn, ttlMs);
    }
    return hit.value as T;
  }

  return fetchValue(key, fn, ttlMs);
}

function refresh<T>(key: string, fn: () => Promise<T>, ttlMs: number): void {
  if (inflight.has(key)) {
    return;
  }

  const promise = fn()
    .then((value) => setCache(key, value, ttlMs))
    .catch(() => {
      // Keep serving the stale value; refresh failures are non-fatal.
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
}

function fetchValue<T>(key: string, fn: () => Promise<T>, ttlMs: number): Promise<T> {
  const pending = inflight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const promise = fn()
    .then((value) => {
      setCache(key, value, ttlMs);
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

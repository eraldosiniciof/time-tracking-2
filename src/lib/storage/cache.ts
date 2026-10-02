/** Cache de localStorage (js-cache-storage) — Map em nível de módulo. */
const storageCache = new Map<string, string | null>();

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key) storageCache.delete(e.key);
  });
}

export function getLocalStorage(key: string): string | null {
  if (!storageCache.has(key)) {
    try {
      storageCache.set(key, localStorage.getItem(key));
    } catch {
      storageCache.set(key, null);
    }
  }
  return storageCache.get(key) ?? null;
}

export function setLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
    storageCache.set(key, value);
  } catch {
    // quota / private mode
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
  storageCache.delete(key);
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = getLocalStorage(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  setLocalStorage(key, JSON.stringify(value));
}

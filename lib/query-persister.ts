import { get, set, del } from "idb-keyval";
import type {
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client";
import { CACHE_MAX_AGE } from "./query-client";

const STORAGE_KEY = "otakuz-query-cache-v1";
const MAX_QUERIES = 150;
const MAX_BYTES = 8 * 1024 * 1024;

export function limitPersistedClient(
  client: PersistedClient,
  now = Date.now(),
): PersistedClient {
  let bytes = 0;
  const queries = client.clientState.queries
    .filter((query) => now - query.state.dataUpdatedAt < CACHE_MAX_AGE)
    .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt)
    .filter((query) => {
      try {
        // A conservative UTF-16 estimate keeps a long browsing session bounded.
        const size = JSON.stringify(query).length * 2;
        if (bytes + size > MAX_BYTES) return false;
        bytes += size;
        return true;
      } catch {
        return false;
      }
    })
    .slice(0, MAX_QUERIES);
  return { ...client, clientState: { mutations: [], queries } };
}

/** Storage is optional: private browsing, quota errors, and blocked IDB fall back to memory. */
export function createQueryPersister(): Persister {
  let pending: PersistedClient | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let unavailable = false;
  let writes = Promise.resolve();
  return {
    persistClient(client) {
      if (unavailable || typeof indexedDB === "undefined") return;
      pending = client;
      if (timer) return;
      timer = setTimeout(() => {
        timer = undefined;
        const snapshot = pending;
        pending = undefined;
        if (!snapshot) return;
        writes = writes.then(async () => {
          try {
            await set(STORAGE_KEY, limitPersistedClient(snapshot));
          } catch {
            unavailable = true;
          }
        });
      }, 1000);
    },
    async restoreClient() {
      if (typeof indexedDB === "undefined") return;
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        const client = await Promise.race([
          get<PersistedClient>(STORAGE_KEY),
          new Promise<undefined>((resolve) => {
            timeout = setTimeout(() => {
              unavailable = true;
              resolve(undefined);
            }, 1500);
          }),
        ]);
        if (!client || !Array.isArray(client.clientState?.queries)) return;
        return limitPersistedClient(client);
      } catch {
        unavailable = true;
        return;
      } finally {
        clearTimeout(timeout);
      }
    },
    async removeClient() {
      clearTimeout(timer);
      timer = undefined;
      pending = undefined;
      try {
        await writes;
        if (typeof indexedDB !== "undefined") await del(STORAGE_KEY);
      } catch {
        /* The in-memory cache continues working without persistent storage. */
      }
    },
  };
}

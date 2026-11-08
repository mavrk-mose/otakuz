const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { QueryObserver } = require("@tanstack/react-query");
const {
  persistQueryClientSave,
  persistQueryClientRestore,
} = require("@tanstack/react-query-persist-client");
function load(file, mocks = {}, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: 1, jsx: 4 },
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    require: (name) =>
      name in mocks
        ? mocks[name]
        : name.startsWith("@/")
          ? load(path.resolve(name.slice(2) + ".ts"), mocks, globals)
          : name.startsWith(".")
            ? load(path.resolve(path.dirname(file), name + ".ts"), mocks, globals)
            : require(name),
    console,
    setTimeout,
    clearTimeout,
    Date,
    ...globals,
  });
  return exports;
}
const {
  createAppQueryClient,
  shouldPersistQuery,
  CACHE_MAX_AGE,
  CACHE_BUSTER,
  refreshStaleQueries,
  clearAccountQueries,
} = load("lib/query-client.ts");
const { limitPersistedClient } = load("lib/query-persister.ts");
const persistence = {
  maxAge: CACHE_MAX_AGE,
  buster: CACHE_BUSTER,
  dehydrateOptions: {
    shouldDehydrateQuery: shouldPersistQuery,
    shouldDehydrateMutation: () => false,
  },
};

test("repeated anime visits and a reload reuse fresh data without a second request", async () => {
  const client = createAppQueryClient();
  const restored = createAppQueryClient();
  let calls = 0,
    stored;
  const options = {
    queryKey: ["animeDetail", "1"],
    queryFn: async () => {
      calls++;
      return { title: "Anime" };
    },
  };
  const persister = {
    persistClient: async (value) => {
      stored = value;
    },
    restoreClient: async () => stored,
    removeClient: async () => {
      stored = undefined;
    },
  };
  try {
    await client.fetchQuery(options);
    await client.fetchQuery(options);
    assert.equal(calls, 1);
    await persistQueryClientSave({ queryClient: client, persister, ...persistence });
    await persistQueryClientRestore({ queryClient: restored, persister, ...persistence });
    assert.equal((await restored.fetchQuery(options)).title, "Anime");
    assert.equal(calls, 1, "Fresh restored data must not hit the server");
    await restored.invalidateQueries({ queryKey: ["animeDetail", "1"] });
    await restored.fetchQuery(options);
    assert.equal(calls, 2, "Explicit invalidation must override the long freshness window");
  } finally {
    client.clear();
    restored.clear();
  }
});

test("background refresh keeps the visible data and only requests stale active queries", async () => {
  const client = createAppQueryClient();
  let activeCalls = 0,
    inactiveCalls = 0,
    finish;
  const old = Date.now() - 7 * 60 * 60 * 1000;
  client.setQueryData(["animeDetail", "active"], { title: "Cached" }, { updatedAt: old });
  client.setQueryData(["animeDetail", "inactive"], { title: "Inactive" }, { updatedAt: old });
  await client.fetchQuery({
    queryKey: ["animeDetail", "inactive"],
    queryFn: async () => {
      inactiveCalls++;
      return { title: "Inactive" };
    },
    staleTime: Infinity,
  });
  const observer = new QueryObserver(client, {
    queryKey: ["animeDetail", "active"],
    refetchOnMount: false,
    queryFn: () => {
      activeCalls++;
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
  });
  const unsubscribe = observer.subscribe(() => {});
  try {
    const refreshed = refreshStaleQueries(client);
    assert.equal(client.getQueryData(["animeDetail", "active"]).title, "Cached");
    assert.equal(activeCalls, 1);
    assert.equal(inactiveCalls, 0);
    finish({ title: "Fresh" });
    await refreshed;
    assert.equal(client.getQueryData(["animeDetail", "active"]).title, "Fresh");
  } finally {
    unsubscribe();
    client.clear();
  }
});

test("private account data, chat rooms, and failed responses are never persisted", async () => {
  const client = createAppQueryClient();
  let stored;
  try {
    for (const key of [
      ["animeDetail", "1"],
      ["lists", "alice"],
      ["bookmarkLists", "alice", "1"],
      ["listItems", "alice", "board"],
      ["communityUsers", 50],
      ["room", "live"],
      ["globalSearch", "chatrooms", "alice"],
    ])
      client.setQueryData(key, { value: "data" });
    await client
      .fetchQuery({
        queryKey: ["product", "failed"],
        queryFn: async () => {
          throw new Error("offline");
        },
        retry: false,
      })
      .catch(() => {});
    await persistQueryClientSave({
      queryClient: client,
      persister: {
        persistClient: async (v) => {
          stored = v;
        },
      },
      ...persistence,
    });
    assert.equal(stored.clientState.queries.length, 1);
    assert.equal(stored.clientState.queries[0].queryKey.join("/"), "animeDetail/1");
    clearAccountQueries(client);
    assert.equal(client.getQueryData(["lists", "alice"]), undefined);
    assert.ok(client.getQueryData(["animeDetail", "1"]));
  } finally {
    client.clear();
  }
});

test("persisted data expires and storage size is bounded", async () => {
  const client = createAppQueryClient();
  const now = Date.now();
  try {
    for (let i = 0; i < 180; i++)
      client.setQueryData(["animeDetail", String(i)], { title: "Anime" }, { updatedAt: now - i });
    client.setQueryData(["animeDetail", "expired"], {}, { updatedAt: now - CACHE_MAX_AGE - 1 });
    let stored;
    await persistQueryClientSave({
      queryClient: client,
      persister: {
        persistClient: async (v) => {
          stored = v;
        },
      },
      ...persistence,
    });
    const limited = limitPersistedClient(stored, now);
    assert.equal(limited.clientState.queries.length, 150);
    assert.ok(limited.clientState.queries.every((q) => q.queryKey[1] !== "expired"));
    const target = createAppQueryClient();
    let removed = false;
    try {
      await persistQueryClientRestore({
        queryClient: target,
        persister: {
          restoreClient: async () => ({ ...stored, timestamp: now - CACHE_MAX_AGE - 1 }),
          removeClient: async () => {
            removed = true;
          },
        },
        ...persistence,
      });
      assert.equal(target.getQueryCache().getAll().length, 0);
      assert.equal(removed, true);
    } finally {
      target.clear();
    }
  } finally {
    client.clear();
  }
});

test("shop filters use distinct cursor queries and delegate filtering and ordering to Sanity", async () => {
  let captured;
  const calls = [];
  const hook = load("hooks/shop/use-fetch-products.ts", {
    "@tanstack/react-query": {
      useInfiniteQuery: (options) => {
        captured = options;
        return { data: { pages: [{ items: [{ _id: "1" }], total: 1 }] } };
      },
    },
    "@/lib/sanity": {
      client: {
        fetch: async (query, params, options) => {
          calls.push({ query, params, ...options });
          return { items: [], total: 0 };
        },
      },
    },
  }).default;
  hook({ category: "shirts" });
  const shirts = captured;
  hook({ category: "all", sortBy: "price-low" });
  const sorted = captured;
  assert.notEqual(JSON.stringify(shirts.queryKey), JSON.stringify(sorted.queryKey));
  assert.equal(shirts.select, undefined);
  await shirts.queryFn({ pageParam: null, signal: "cancel-token" });
  await sorted.queryFn({ pageParam: { id: "p1", value: 20 }, signal: "cancel-token" });
  assert.equal(calls[0].params.categories[0], "shirts");
  assert.ok(calls[1].query.includes("order(price asc"));
  assert.equal(calls[1].params.cursorId, "p1");
  assert.equal(calls[1].signal, "cancel-token");
});

test("unavailable browser storage falls back to memory without blocking startup", async () => {
  const { createQueryPersister } = load(
    "lib/query-persister.ts",
    {
      "idb-keyval": {
        get: async () => {
          throw new Error("Storage blocked");
        },
        set: async () => {
          throw new Error("Quota exceeded");
        },
        del: async () => {
          throw new Error("Storage blocked");
        },
      },
    },
    { indexedDB: {} },
  );
  const persister = createQueryPersister();
  assert.equal(await persister.restoreClient(), undefined);
  await persister.persistClient({
    timestamp: Date.now(),
    buster: CACHE_BUSTER,
    clientState: { mutations: [], queries: [] },
  });
  await persister.removeClient();
});

test("restoring cached data does not briefly show a not-found state", () => {
  const hook = load("hooks/anime/use-anime-details.ts", {
    "@tanstack/react-query": {
      queryOptions: (value) => value,
      useQuery: () => ({ data: undefined, isPending: true, isLoading: false }),
    },
    "@/lib/api-config": { API_BASE_URL: "/api/jikan" },
  }).default;
  assert.equal(hook("1").isLoading, true);
});

test("missing anime and temporary failures retain distinct status and retry behaviour", async () => {
  let options;
  const hook = load(
    "hooks/anime/use-anime-details.ts",
    {
      "@tanstack/react-query": {
        queryOptions: (value) => value,
        useQuery: (value) => {
          options = value;
          return { isPending: true };
        },
      },
      "@/lib/api-config": { API_BASE_URL: "/api/jikan" },
    },
    { fetch: async () => ({ ok: false, status: 404 }) },
  ).default;
  hook("1");
  await assert.rejects(options.queryFn({ signal: undefined }), (error) => error.status === 404);
  assert.equal(options.retry(0, { status: 404 }), false);
  assert.equal(options.retry(0, { status: 503 }), true);
  assert.equal(hook("not-an-id").isLoading, false);
  assert.equal(options.enabled, false);
});

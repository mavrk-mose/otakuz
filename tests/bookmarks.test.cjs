const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
function setup() {
  const cache = new Map(),
    mutations = [],
    invalidated = [],
    writes = [];
  const key = (value) => JSON.stringify(value);
  const matching = (prefix) =>
    [...cache].filter(([k]) => prefix.every((v, i) => JSON.parse(k)[i] === v));
  const client = {
    cancelQueries: async () => {},
    getQueryData: (k) => cache.get(key(k)),
    setQueryData: (k, value) =>
      cache.set(key(k), typeof value === "function" ? value(cache.get(key(k))) : value),
    removeQueries: ({ queryKey }) => cache.delete(key(queryKey)),
    getQueriesData: ({ queryKey }) => matching(queryKey).map(([k, v]) => [JSON.parse(k), v]),
    setQueriesData: ({ queryKey }, update) =>
      matching(queryKey).forEach(([k, v]) => cache.set(k, update(v))),
    invalidateQueries: ({ queryKey }) => invalidated.push(queryKey),
  };
  const exports = {};
  const firestore = new Proxy(
    {},
    {
      get: (_, name) =>
        name === "writeBatch"
          ? () => ({
              set: (...args) => writes.push(["set", ...args]),
              update: (...args) => writes.push(["update", ...args]),
              delete: (...args) => writes.push(["delete", ...args]),
              commit: async () => writes.push(["commit"]),
            })
          : (...args) => ({ name, args }),
    },
  );
  const requireMock = (name) => {
    if (name === "@/lib/firebase") return { db: {} };
    if (name === "./use-auth") return { useAuth: () => ({ user: { uid: "viewer" } }) };
    if (name === "firebase/firestore") return firestore;
    if (name === "@tanstack/react-query")
      return {
        useQuery: () => ({ data: [] }),
        useMutation: (options) => {
          mutations.push(options);
          return {};
        },
        useQueryClient: () => client,
        useIsMutating: () => 0,
      };
    throw new Error(name);
  };
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync("hooks/use-bookmarks.ts", "utf8"), {
      compilerOptions: { module: 1 },
    }).outputText,
    { exports, require: requireMock, console },
  );
  exports.useBookmarks();
  const item = { id: "20", type: "anime", title: "Test", image: "cover" };
  const statusKey = ["bookmarkLists", "viewer", "20"];
  const listsKey = ["lists", "viewer", true];
  const pagesKey = ["listItems", "viewer", "favorites"];
  client.setQueryData(statusKey, []);
  client.setQueryData(listsKey, [{ id: "favorites", items: [] }]);
  client.setQueryData(pagesKey, { pages: [{ items: [], lastDoc: null }], pageParams: [null] });
  return { client, mutations, item, statusKey, listsKey, pagesKey, invalidated, writes };
}
test("save updates status and profile immediately and restores them on failure", async () => {
  const { client, mutations, item, statusKey, listsKey, pagesKey } = setup();
  const variables = { listId: "favorites", item };
  const context = await mutations[0].onMutate(variables);
  assert.equal(client.getQueryData(statusKey).join(","), "favorites");
  assert.equal(client.getQueryData(listsKey)[0].items[0].id, "20");
  assert.equal(client.getQueryData(pagesKey).pages[0].items[0].id, "20");
  mutations[0].onError(new Error("offline"), variables, context);
  assert.equal(client.getQueryData(statusKey).length, 0);
  assert.equal(client.getQueryData(listsKey)[0].items.length, 0);
  assert.equal(client.getQueryData(pagesKey).pages[0].items.length, 0);
});
test("remove keeps other memberships, restores on failure, and clears final membership immediately", async () => {
  const { client, mutations, item, statusKey, listsKey } = setup();
  client.setQueryData(statusKey, ["favorites", "planning"]);
  client.setQueryData(listsKey, [{ id: "favorites", items: [item] }]);
  const vars = { listId: "favorites", itemId: "20" };
  const context = await mutations[1].onMutate(vars);
  assert.equal(client.getQueryData(statusKey).join(","), "planning");
  assert.equal(client.getQueryData(listsKey)[0].items.length, 0);
  mutations[1].onError(new Error("offline"), vars, context);
  assert.equal(client.getQueryData(statusKey).length, 2);
  assert.equal(client.getQueryData(listsKey)[0].items.length, 1);
  client.setQueryData(statusKey, ["favorites"]);
  await mutations[1].onMutate(vars);
  assert.equal(client.getQueryData(statusKey).length, 0);
});
test("writes bookmark and parent timestamp in one atomic commit then revalidates", async () => {
  const { mutations, item, writes, invalidated } = setup();
  const vars = { listId: "favorites", item };
  await mutations[0].mutationFn(vars);
  assert.equal(writes.map((w) => w[0]).join(","), "set,update,commit");
  mutations[0].onSettled(undefined, null, vars);
  assert.equal(invalidated.length, 3);
});

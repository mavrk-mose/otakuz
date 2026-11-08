const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const vm = require("node:vm");
const source = ts.transpileModule(fs.readFileSync("store/use-player-store.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const moduleExports = {};
vm.runInNewContext(source, { exports: moduleExports, require, console });
const store = moduleExports.usePlayerStore;
const promos = ["first", "second", "third"].map((id) => ({
  id,
  src: `https://example.com/${id}`,
  title: id,
  playerRoute: `/watch/1?videoUrl=${id}`,
}));
test("watch queue autoplays the first promo and advances in order, stopping at the end", () => {
  store.getState().close();
  store.getState().openQueue(promos);
  assert.equal(store.getState().videoSrc, promos[0].src);
  assert.equal(store.getState().autoPlay, true);
  store.getState().setCurrentPlaybackTime(42);
  store.getState().minimize();
  assert.equal(store.getState().advanceQueue().src, promos[1].src);
  assert.equal(store.getState().currentPlaybackTime, 0);
  assert.equal(store.getState().isMinimized, true);
  assert.equal(store.getState().advanceQueue().src, promos[2].src);
  assert.equal(store.getState().advanceQueue(), null);
  assert.equal(store.getState().autoPlay, false);
  assert.equal(store.getState().isPlaying, false);
});
test("manual selection starts at the chosen promo, and unrelated videos clear the queue", () => {
  store.getState().openQueue(promos, 1);
  assert.equal(store.getState().videoSrc, promos[1].src);
  assert.equal(store.getState().advanceQueue().src, promos[2].src);
  store.getState().openPlayer({ id: "channel", src: "https://example.com/live" });
  assert.equal(store.getState().advanceQueue(), null);
  assert.equal(store.getState().videoSrc, "https://example.com/live");
  store.getState().close();
  assert.equal(store.getState().queue.length, 0);
});

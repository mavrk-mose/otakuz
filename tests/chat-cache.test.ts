import "fake-indexeddb/auto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { getCachedMessages, putCachedMessages, deleteCachedMessage, getCachedRoom, putCachedRoom, replaceCachedRooms, getCachedRooms } from "@/lib/chat-cache";
import type { Message } from "@/types/message";

const message = (id: number): Message => ({ id: String(id), userId: "u", username: "User", message: `Message ${id}`, timestamp: id, type: "text", deliveryStatus: "sent" });
test("idb reads the existing native IndexedDB layout without migrating away user data", async () => {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("otakuz-chat-cache", 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      database.createObjectStore("messages", { keyPath: "cacheKey" }).createIndex("roomKey", "roomKey");
      database.createObjectStore("rooms", { keyPath: "cacheKey" }).createIndex("userId", "userId");
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const database = request.result, tx = database.transaction("messages", "readwrite");
      tx.objectStore("messages").put({ ...message(1), cacheKey: "legacy:r:1", roomKey: "legacy:r", cachedAt: 1 });
      tx.oncomplete = () => { database.close(); resolve(); };
    };
  });
  assert.deepEqual((await getCachedMessages("legacy", "r")).map(item => item.id), ["1"]);
});
test("chat cache enforces account isolation, settled delivery, ordering, and size limit", async () => {
  await putCachedMessages("alice", "room", Array.from({ length: 120 }, (_, i) => message(i)));
  await putCachedMessages("bob", "room", [message(999)]);
  await putCachedMessages("alice", "room", [{ ...message(1000), deliveryStatus: "sending" }, { ...message(1001), deliveryStatus: "error" }, { ...message(1002), fileUrl: "blob:temporary" }]);
  const alice = await getCachedMessages("alice", "room");
  assert.equal(alice.length, 100); assert.equal(alice[0].id, "20"); assert.equal(alice.at(-1)?.id, "119");
  assert.deepEqual((await getCachedMessages("bob", "room")).map(item => item.id), ["999"]);
  await deleteCachedMessage("alice", "room", "119"); assert.equal((await getCachedMessages("alice", "room")).length, 99);
});
test("room replacement affects only the selected account", async () => {
  const room = { title: "Room", members: ["alice"], memberCount: 1 };
  await putCachedRoom("alice", "r", room); await putCachedRoom("bob", "r", room);
  assert.equal((await getCachedRoom("alice", "r"))?.title, "Room");
  await replaceCachedRooms("alice", []);
  assert.equal((await getCachedRooms("alice")).length, 0); assert.equal((await getCachedRooms("bob")).length, 1);
});

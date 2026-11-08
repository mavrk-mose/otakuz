import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { ApiError, fetchJson, retryApiRequest } from "@/lib/http";
import { profileSettingsDefaults, profileSettingsSchema } from "@/lib/schemas/profile-settings";
import { roomEventSchema } from "@/lib/schemas/watch-party";
import { mediaRecordSchema } from "@/lib/schemas/media";
import { translate, messages, type MessageKey } from "@/lib/i18n";
import { serializeGenre, serializeVideo } from "@/lib/query-state";
import { animeVideosOptions } from "@/hooks/anime/use-anime-videos";

const originalFetch = globalThis.fetch;
test("HTTP errors preserve status; invalid payloads and client errors are not retried", async () => {
  try {
    globalThis.fetch = async () => new Response("", { status: 429 });
    await assert.rejects(
      fetchJson("/test", z.object({ id: z.number() })),
      (error) => error instanceof ApiError && error.status === 429 && retryApiRequest(0, error),
    );
    assert.equal(retryApiRequest(0, new ApiError("missing", 404)), false);
    assert.equal(retryApiRequest(2, new ApiError("server", 500)), false);
    globalThis.fetch = async () => Response.json({ id: "wrong" });
    await assert.rejects(
      fetchJson("/test", z.object({ id: z.number() })),
      (error) => error instanceof z.ZodError && !retryApiRequest(0, error),
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
test("profile defaults preserve explicitly disabled preferences and reject invalid edits", () => {
  const defaults = profileSettingsDefaults(null);
  assert(profileSettingsSchema.safeParse(defaults).success);
  assert(!profileSettingsSchema.safeParse({ ...defaults, username: "bad handle" }).success);
  assert(
    !profileSettingsSchema.safeParse({ ...defaults, photoURL: "javascript:alert(1)" }).success,
  );
  assert(!profileSettingsSchema.safeParse({ ...defaults, bio: "x".repeat(2001) }).success);
  assert(
    profileSettingsSchema.safeParse({ ...defaults, soundEffects: false, isPublic: false }).success,
  );
});
test("watch-party events reject malformed messages and invalid state", () => {
  assert(roomEventSchema.safeParse({ type: "pong" }).success);
  assert(!roomEventSchema.safeParse({ type: "state_update", payload: { seq: 1 } }).success);
  assert(!roomEventSchema.safeParse({ type: "unknown" }).success);
  const payload = {
    roomId: "r",
    hostId: "h",
    videoUrl: "video",
    isPlaying: true,
    position: 2,
    playbackRate: 1,
    clients: [],
    seq: 1,
  };
  assert(roomEventSchema.safeParse({ type: "state_update", payload }).success);
  assert(
    !roomEventSchema.safeParse({ type: "state_update", payload: { ...payload, position: -1 } })
      .success,
  );
});
test("catalogue validation accepts nullable stats and rejects malformed identities", () => {
  assert(
    mediaRecordSchema.safeParse({
      mal_id: 1,
      title: "Title",
      images: {},
      score: null,
      episodes: null,
    }).success,
  );
  assert(!mediaRecordSchema.safeParse({ mal_id: "1", title: "Title", images: {} }).success);
});
test("all migrated translations retain matching keys and format interpolation without errors", () => {
  const flatten = (object: Record<string, unknown>, prefix = ""): Record<string, string> =>
    Object.fromEntries(
      Object.entries(object).flatMap(([key, value]) =>
        typeof value === "string"
          ? [[prefix + key, value]]
          : Object.entries(flatten(value as Record<string, unknown>, `${prefix}${key}.`)),
      ),
    );
  const english = flatten(messages.en),
    japanese = flatten(messages.ja);
  assert.deepEqual(Object.keys(english).sort(), Object.keys(japanese).sort());
  for (const [key, value] of Object.entries(english)) {
    const values = Object.fromEntries(
      Array.from(value.matchAll(/\{(\w+)\}/g), (match) => [match[1], 3]),
    );
    assert.equal(translate("en", key as MessageKey, values), value.replace(/\{\w+\}/g, "3"), key);
    assert.notEqual(translate("ja", key as MessageKey, values), key);
  }
  assert.equal(translate("ja", "calendar.animeCount", { count: 7 }), "7件のアニメ");
});
test("nuqs serializes category links without losing other query parameters or hashes", () => {
  assert.equal(
    serializeGenre("/anime?sort=score#list", { genre: "4" }),
    "/anime?sort=score&genre=4#list",
  );
  const video = "https://www.youtube.com/embed/abc?start=3&x=4";
  assert.equal(
    new URL(
      serializeVideo("/watch/1", { videoUrl: video }),
      "https://example.com",
    ).searchParams.get("videoUrl"),
    video,
  );
});
test("video fetch validation keeps playable queues and excludes episode data", async () => {
  try {
    globalThis.fetch = async () =>
      Response.json({
        data: {
          promo: [{ title: "Missing", trailer: { embed_url: null } }],
          music_videos: [
            { title: "Opening", video: { embed_url: "https://www.youtube.com/embed/a" } },
          ],
          episodes: [{ title: "Unrelated" }],
        },
      });
    const options = animeVideosOptions("1");
    const data = await options.queryFn!({
      signal: new AbortController().signal,
      queryKey: options.queryKey,
      meta: undefined,
      client: {},
    } as never);
    assert.equal(data.promo.length, 0);
    assert.equal(data.music_videos.length, 1);
    assert(!("episodes" in data));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("shop URL parsers reject invalid prices and sorts while retaining valid filters", async () => {
  const { shopFilterParsers } = await import("@/lib/query-state");
  assert.equal(shopFilterParsers.minPrice.parse("-1"), null);
  assert.equal(shopFilterParsers.maxPrice.parse("NaN"), null);
  assert.equal(shopFilterParsers.minPrice.parse("12.50"), "12.50");
  assert.equal(shopFilterParsers.sort.parse("unknown"), null);
  assert.equal(shopFilterParsers.sort.parse("price-low"), "price-low");
  assert.equal(shopFilterParsers.inStock.parse("true"), true);
});

test("global search validates CMS and community records before matching", async () => {
  const { searchProductsSchema, searchEventsSchema, searchUsersSchema } =
    await import("@/lib/schemas/search-sources");
  assert(
    searchProductsSchema.safeParse([
      { _id: "p", name: "Figure", price: 20, category: null, image: null },
    ]).success,
  );
  assert(!searchProductsSchema.safeParse([{ _id: "p", name: "Figure", price: "20" }]).success);
  assert(
    searchEventsSchema.safeParse([{ _id: "e", title: "Meetup", date: null, location: null }])
      .success,
  );
  assert(!searchUsersSchema.safeParse([{ uid: "u", displayName: {}, username: "@user" }]).success);
});
test("pagination advances from the requested page when endpoint metadata omits its number", async () => {
  const { paginationSchema, withCurrentPage } = await import("@/lib/schemas/media");
  const pagination = paginationSchema.parse({ has_next_page: true });
  assert.equal(withCurrentPage({ data: [], pagination }, 4).pagination.current_page, 4);
  assert.equal(
    withCurrentPage({ data: [], pagination: { current_page: 5, has_next_page: true } }, 4)
      .pagination.current_page,
    5,
  );
});

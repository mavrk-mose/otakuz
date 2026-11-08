import { test } from "node:test";
import assert from "node:assert/strict";
import { parse, evaluate } from "groq-js";
import { buildProductQuery } from "@/hooks/shop/use-fetch-products";
import { buildEventQuery } from "@/hooks/events/use-fetch-events";
import { catalogFacetsQuery } from "@/hooks/shop/use-catalog-facets";
import { titlesQuery } from "@/hooks/shop/use-fetch-titles";
import { toSanityPage, type SanityCursor } from "@/lib/sanity-pagination";
import { buildNewsPageQuery, newsHighlightsQuery } from "@/hooks/news/use-fetch-news";

const titles = [
  { _type: "title", _id: "t1", name: "Naruto" },
  { _type: "title", _id: "t2", name: "Bleach" },
];
const product = (
  id: string,
  price: number,
  stock = 1,
  category = "Figures",
  title = "t1",
  rating: number | null = 4,
) => ({
  _type: "product",
  _id: id,
  _createdAt: "2026-11-01T00:00:00Z",
  name: `Figure ${id}`,
  price,
  stock,
  category,
  title: { _type: "reference", _ref: title },
  rating,
});
const dataset = [
  ...titles,
  product("p1", 10),
  product("p2", 10, 0),
  product("p3", 30),
  product("p4", 100, 2, "Clothing", "t2", null),
  product("drafts.p5", 1),
];
async function run(query: string, params: Record<string, unknown> = {}, data: object[] = dataset) {
  return (await evaluate(parse(query, { params }), { dataset: data, params })).get();
}
test("Sanity product filters and total counts run before pagination", async () => {
  const request = buildProductQuery({
    category: "Figures",
    title: "Naruto",
    minPrice: 10,
    maxPrice: 30,
    inStock: true,
    limit: 1,
    sort: "price-low",
  });
  const response = await run(request.query, request.params);
  assert.equal(response.total, 2);
  assert.deepEqual(
    response.items.map((item: { _id: string }) => item._id),
    ["p1", "p3"],
  );
  const page = toSanityPage(response, request.limit);
  assert.deepEqual(
    page.items.map((item) => item._id),
    ["p1"],
  );
  assert.deepEqual(page.nextCursor, { id: "p1", value: 10 });
});
test("all product sorts paginate tied values without omissions or repeats", async () => {
  for (const sort of ["newest", "price-low", "price-high", "rating"]) {
    const ids: string[] = [];
    let cursor: SanityCursor | null = null;
    do {
      const request = buildProductQuery({ sort, limit: 2, cursor });
      const page = toSanityPage<{ _id: string }>(
        await run(request.query, request.params),
        request.limit,
      );
      ids.push(...page.items.map((item) => item._id));
      cursor = page.nextCursor;
    } while (cursor);
    assert.equal(ids.length, 4, sort);
    assert.equal(new Set(ids).size, 4, sort);
    assert(!ids.includes("drafts.p5"));
    if (sort === "price-high") assert.equal(ids[0], "p4");
    if (sort === "price-low") assert.deepEqual(ids.slice(0, 2), ["p1", "p2"]);
  }
});
test("CMS search can find matches beyond the first page without loading the catalogue", async () => {
  const data = Array.from({ length: 50 }, (_, i) => ({
    ...product(`p${i}`, i + 1),
    name: i === 49 ? "Special Naruto" : "Other",
  }));
  const request = buildProductQuery({ search: "Naruto", sort: "relevance", limit: 5 });
  const response = await run(request.query, request.params, data);
  assert.equal(response.total, 1);
  assert.equal(response.items[0]._id, "p49");
  const malicious = buildProductQuery({ search: '\"] || true || ["' });
  assert(!malicious.query.includes('\"] || true || ["'));
  assert.equal(malicious.params.search, '\"] || true || ["');
});
test("facets and price bounds cover the full catalogue rather than the loaded page", async () => {
  const facets = await run(catalogFacetsQuery);
  assert.deepEqual(facets.categories, ["Clothing", "Figures"]);
  assert.equal(facets.minPrice, 10);
  assert.equal(facets.maxPrice, 100);
  assert.deepEqual(
    facets.titles.map((title: { name: string }) => title.name),
    ["Bleach", "Naruto"],
  );
  const empty = await run(catalogFacetsQuery, {}, []);
  assert.equal(empty.minPrice, 0);
  assert.equal(empty.maxPrice, 0);
});
test("product price buckets are applied by GROQ", async () => {
  const request = buildProductQuery({ priceRanges: ["under-25"] });
  const response = await run(request.query, request.params);
  assert.equal(response.total, 2);
});
test("events query separates upcoming and past events and returns attendee previews with full counts", async () => {
  const events = [
    {
      _type: "event",
      _id: "e1",
      title: "Future",
      date: "2026-11-10",
      attendees: Array.from({ length: 8 }, (_, i) => ({ name: `User ${i}` })),
    },
    { _type: "event", _id: "e2", title: "Past", date: "2026-11-01" },
    { _type: "event", _id: "e3", title: "TBA" },
  ];
  const upcoming = buildEventQuery({ period: "upcoming", today: "2026-11-08" });
  const response = await run(upcoming.query, upcoming.params, events);
  assert.deepEqual(
    response.items.map((item: { _id: string }) => item._id),
    ["e1", "e3"],
  );
  assert.equal(response.items[0].attendees.length, 5);
  assert.equal(response.items[0].attendeeCount, 8);
  const past = buildEventQuery({ period: "past", today: "2026-11-08" });
  assert.deepEqual(
    (await run(past.query, past.params, events)).items.map((item: { _id: string }) => item._id),
    ["e2"],
  );
});
test("title cards are fetched in bounded cursor pages", async () => {
  const rows = await run(titlesQuery, { cursorId: "t1", fetchLimit: 2 });
  assert.deepEqual(
    rows.map((row: { _id: string }) => row._id),
    ["t2"],
  );
});
test("news categories, ordering, highlights and cursor ties are evaluated by GROQ", async () => {
  const data = [
    { _type: "category", _id: "c", title: "Industry" },
    ...Array.from({ length: 6 }, (_, i) => ({
      _type: "article",
      _id: `n${i}`,
      title: `News ${i}`,
      publishedAt: "2026-11-08T00:00:00Z",
      categories: [{ _ref: "c" }],
      isFeatured: i === 3,
      trendingRank: 6 - i,
      podcast: { isPodcast: i === 4 },
    })),
    { _type: "article", _id: "other", title: "Interview", section: "Interviews" },
  ];
  const request = buildNewsPageQuery("industry", null, 2);
  const response = await run(request.query, request.params, data);
  assert.equal(response.total, 6);
  const page = toSanityPage(response, 2),
    next = buildNewsPageQuery("industry", page.nextCursor, 2);
  assert.equal((await run(next.query, next.params, data)).items[0]._id, "n2");
  const highlights = await run(
    newsHighlightsQuery,
    { category: "Industry", categoryLower: "industry" },
    data,
  );
  assert.equal(highlights.lead[0]._id, "n3");
  assert.equal(highlights.trending[0]._id, "n5");
  assert.equal(highlights.podcast._id, "n4");
});

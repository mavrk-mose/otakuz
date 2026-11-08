const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, env = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const context = {
    exports: {},
    require: (name) =>
      name === "@/lib/adsense-config" ? load("lib/adsense-config.ts", env) : require(name),
    process: { env },
  };
  vm.runInNewContext(source, context);
  return context.exports;
}

test("AdSense uses a native async script without Next.js attributes", () => {
  const { AdSenseScript } = load("components/ads/adsense-script.tsx", {
    NEXT_PUBLIC_ADSENSE_CLIENT_ID: "ca-pub-8820415871877478",
  });
  const element = AdSenseScript();
  assert.equal(element.type, "script");
  assert.equal(element.props.async, true);
  assert.equal(element.props.crossOrigin, "anonymous");
  assert.equal(element.props["data-nscript"], undefined);
  assert.equal(element.props.strategy, undefined);
});

test("AdSense uses the supplied publisher without deployment overrides", () => {
  assert.equal(
    load("components/ads/adsense-script.tsx").AdSenseScript().props.src,
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8820415871877478",
  );
});

test("Rejects example slots and normalizes configured slots", () => {
  const { resolveAdSenseSlot } = load("lib/adsense-config.ts");
  assert.equal(resolveAdSenseSlot("1234567890", ""), "");
  assert.equal(resolveAdSenseSlot("not-a-slot", ""), "");
  assert.equal(resolveAdSenseSlot(" 1252363648 ", ""), "1252363648");
  assert.equal(resolveAdSenseSlot("  ", "1252363648"), "1252363648");
  assert.equal(resolveAdSenseSlot("1234567890", "1252363648"), "1252363648");
});

test("Fluid format requires its matching layout key", () => {
  const { resolveAdSenseFormat } = load("lib/adsense-config.ts");
  assert.equal(resolveAdSenseFormat("fluid"), "auto");
  assert.equal(resolveAdSenseFormat("fluid", "-ab+c1"), "fluid");
  assert.equal(resolveAdSenseFormat("rectangle"), "rectangle");
});

// Exercise the rendered ad request attributes, including the placement-to-default fallback.
function renderAd(env, props, status) {
  const react = require("react");
  const config = load("lib/adsense-config.ts");
  const source = ts.transpileModule(fs.readFileSync("components/ads/google-ad-unit.tsx", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const context = {
    exports: {},
    process: { env },
    require(name) {
      if (name === "react")
        return {
          ...react,
          useEffect() {},
          useMemo: (fn) => fn(),
          useRef: (value) => ({ current: value }),
          useState: (value) => [value === "pending" && status ? status : value, () => {}],
        };
      if (name === "@/components/i18n-provider")
        return { useI18n: () => ({ locale: "en", t: (key) => key }) };
      if (name === "@/lib/adsense-config") return config;
      if (name === "@/lib/ads-catalog")
        return { getCampaignsForContext: () => [{ interestTag: "Anime & Merch" }] };
      if (name.startsWith("@/"))
        return new Proxy({}, { get: (_, key) => (key === "cn" ? () => "" : key) });
      return require(name);
    },
  };
  vm.runInNewContext(source, context);
  return context.exports.GoogleAdUnit({ context: "home", variant: "test", ...props });
}

function findIns(element) {
  if (!element || typeof element !== "object") return undefined;
  if (element.type === "ins") return element;
  for (const child of [element.props?.children].flat(Infinity)) {
    const result = findIns(child);
    if (result) return result;
  }
}

test("The ad component never renders a request for the example slot", () => {
  const env = {
    NEXT_PUBLIC_ADSENSE_CLIENT_ID: "ca-pub-8820415871877478",
    NEXT_PUBLIC_ADSENSE_DEFAULT_SLOT: "1234567890",
  };
  assert.equal(
    findIns(renderAd(env, { adSlot: "1234567890" })).props["data-ad-slot"],
    "1252363648",
  );
  const ad = findIns(
    renderAd(
      { ...env, NEXT_PUBLIC_ADSENSE_DEFAULT_SLOT: "1252363648" },
      { adSlot: "1234567890", adFormat: "fluid" },
    ),
  );
  assert.equal(ad.props["data-ad-slot"], "1252363648");
  assert.equal(ad.props["data-ad-format"], "auto");
});

test("Google keeps its ad container after reporting an unfilled unit", () => {
  const element = renderAd(
    {
      NEXT_PUBLIC_ADSENSE_CLIENT_ID: "ca-pub-8820415871877478",
      NEXT_PUBLIC_ADSENSE_DEFAULT_SLOT: "1252363648",
    },
    {},
    "unfilled",
  );
  assert.ok(findIns(element), "Unfilled containers must stay mounted for Google callbacks");
});

test("Default ad attributes match the supplied general unit snippet", () => {
  const ad = findIns(renderAd({}, {}));
  assert.equal(ad.props["data-ad-client"], "ca-pub-8820415871877478");
  assert.equal(ad.props["data-ad-slot"], "1252363648");
  assert.equal(ad.props["data-ad-format"], "auto");
  assert.equal(ad.props["data-full-width-responsive"], "true");
  assert.equal(ad.props.style.display, "block");
});

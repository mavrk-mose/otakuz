import {
  createParser,
  createSerializer,
  parseAsString,
  parseAsBoolean,
  parseAsStringLiteral,
} from "nuqs/server";

export const parseAsGenre = createParser({
  parse: (value) => (/^[1-9]\d*$/.test(value) ? value : null),
  serialize: (value) => value,
});
export const serializeGenre = createSerializer({ genre: parseAsGenre });
export const serializeVideo = createSerializer({ videoUrl: parseAsString });
export const serializeChannel = createSerializer({ channel: parseAsString });

export const serializeProfile = createSerializer({ userId: parseAsString });
export const serializeShopFilter = createSerializer({ anime: parseAsString });

const parseAsPrice = createParser({
  parse: (value) =>
    value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 ? value : null,
  serialize: (value) => value,
});
export const shopFilterParsers = {
  category: parseAsString,
  anime: parseAsString.withDefault(""),
  q: parseAsString.withDefault(""),
  minPrice: parseAsPrice.withDefault(""),
  maxPrice: parseAsPrice.withDefault(""),
  inStock: parseAsBoolean.withDefault(false),
  sort: parseAsStringLiteral(["newest", "price-low", "price-high", "rating"]).withDefault("newest"),
};

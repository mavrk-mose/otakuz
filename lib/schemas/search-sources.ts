import { z } from "zod";

const optionalText = z.string().nullish();
export const searchProductsSchema = z.array(
  z
    .object({
      _id: z.string(),
      name: z.string(),
      category: optionalText,
      description: optionalText,
      price: z.number().finite(),
      stock: z.number().nullish(),
      rating: z.number().nullish(),
      title: z.object({ name: z.string() }).passthrough().nullish(),
      image: z.array(z.unknown()).nullish(),
    })
    .passthrough(),
);
export const searchEventsSchema = z.array(
  z
    .object({
      _id: z.string(),
      id: z.string().optional(),
      title: z.string(),
      date: optionalText,
      category: optionalText,
      location: z.object({ name: optionalText, address: optionalText }).passthrough().nullish(),
      thumbnailUrl: z.unknown(),
    })
    .passthrough(),
);
export const searchUsersSchema = z.array(
  z
    .object({
      uid: z.string(),
      displayName: z.string(),
      username: z.string(),
      rank: optionalText,
      bio: optionalText,
      boardsCount: z.number().nullish(),
      level: z.number().nullish(),
      photoURL: optionalText,
    })
    .passthrough(),
);

import { createTranslator } from "next-intl";
import en from "@/messages/en.json";
import ja from "@/messages/ja.json";

export const messages = { en, ja };
export type Locale = keyof typeof messages;
type MessagePaths<T> = { [K in keyof T & string]: T[K] extends string ? K : `${K}.${MessagePaths<T[K]>}` }[keyof T & string];
export type MessageKey = MessagePaths<typeof en>;
export const supportedLocales: Locale[] = ["en", "ja"];
const translators = {
  en: createTranslator({ locale: "en", messages: en }),
  ja: createTranslator({ locale: "ja", messages: { ...en, ...ja } }),
};

/** For notifications and other callers outside React. Components use next-intl's context. */
export function translate(locale: Locale, key: MessageKey, values?: Record<string, string | number>) {
  return translators[locale](key, values);
}

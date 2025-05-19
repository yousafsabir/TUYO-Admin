import type { Locale } from "./config";
import En from "./dictionaries/en.json";
import Es from "./dictionaries/es.json";

const dictionaries = {
  en: () => En,
  es: () => Es,
};

export const getDictionary = (locale: Locale) => {
  return dictionaries[locale]();
};

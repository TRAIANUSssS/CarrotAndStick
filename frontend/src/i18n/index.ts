import type { Language } from "../api/auth";
import { en } from "./en";
import { ru } from "./ru";

export const dictionaries = {
  ru,
  en,
} as const;

export type Dictionary = typeof ru;

export const getDictionary = (language: Language): Dictionary => dictionaries[language];


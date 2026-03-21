import type { FormatState } from "./types";

export const INITIAL_LINE1 = "A Minecraft Server";

export const MOTD_CODE_PREFIX = "§";

export const COLOR_CLASSES: Record<string, string> = {
  "0": "text-mc-black",
  "1": "text-mc-dark-blue",
  "2": "text-mc-dark-green",
  "3": "text-mc-dark-aqua",
  "4": "text-mc-dark-red",
  "5": "text-mc-dark-purple",
  "6": "text-mc-gold",
  "7": "text-mc-gray",
  "8": "text-mc-dark-gray",
  "9": "text-mc-blue",
  a: "text-mc-green",
  b: "text-mc-aqua",
  c: "text-mc-red",
  d: "text-mc-light-purple",
  e: "text-mc-yellow",
  f: "text-mc-white",
  l: "font-bold",
  m: "line-through",
  n: "underline",
  o: "italic",
  r: "",
  k: "mc-obfuscated",
};

export const COLOR_KEYS = new Set("0123456789abcdef");

export const FORMAT_KEYS: Record<string, keyof FormatState> = {
  l: "bold",
  m: "strikethrough",
  n: "underline",
  o: "italic",
  k: "obfuscated",
};

export const DEFAULT_STATE: FormatState = {
  color: null,
  bold: false,
  strikethrough: false,
  underline: false,
  italic: false,
  obfuscated: false,
};

export const COLOR_BUTTON_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"] as const;

export const FORMAT_BUTTON_KEYS = ["l", "m", "n", "o", "r", "k"] as const;

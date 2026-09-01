import type { ParsedTellraw, TellrawValue } from "./types";

import { parseSnbt } from "./snbt";

const TELLRAW_REGEX = /^\s*\/?tellraw\s+([^\s]+)\s+([\s\S]+)$/i;

export function parseTellraw(input: string): ParsedTellraw {
  const match = input.match(/^\s*\/?tellraw\s+([^\s]+)\s+([\s\S]+)$/i);

  if (!match) {
    throw new Error(`Invalid tellraw command:\n${input}`);
  }

  const target = match[1];
  const source = match[2].trim();

  // Erst echtes JSON versuchen
  try {
    return {
      command: "tellraw",
      target,
      data: JSON.parse(source),
      format: "json",
      raw: input.trim(),
    };
  } catch {
    // Danach SNBT
    return {
      command: "tellraw",
      target,
      data: parseSnbt(source),
      format: "snbt",
      raw: input.trim(),
    };
  }
}

import type { ParsedTellraw, TellrawValue } from "./types";

export interface StringifyOptions {
  /**
   * Ausgabeformat.
   * Standard: SNBT
   */
  format?: "snbt" | "json";

  /**
   * JSON einrücken.
   */
  pretty?: boolean;

  /**
   * SNBT-Keys immer quoten.
   *
   * false:
   * {text:'Hello',bold:true}
   *
   * true:
   * {'text':'Hello','bold':true}
   */
  quoteKeys?: boolean;

  /**
   * Slash vor tellraw setzen.
   *
   * false:
   * tellraw @a ...
   *
   * true:
   * /tellraw @a ...
   */
  leadingSlash?: boolean;
}

const SAFE_KEY = /^[A-Za-z0-9_+.-]+$/;

export function stringifyTellraw(
  tellraw: ParsedTellraw,
  options: StringifyOptions = {},
): string {
  const {
    format = "snbt",
    pretty = false,
    quoteKeys = false,
    leadingSlash = false,
  } = options;

  const prefix = leadingSlash ? "/tellraw" : "tellraw";

  const data =
    format === "json"
      ? JSON.stringify(tellraw.data, null, pretty ? 2 : 0)
      : stringifySnbt(tellraw.data, {
          quoteKeys,
        });

  return `${prefix} ${tellraw.target} ${data}`;
}

export function stringifySnbt(
  value: TellrawValue,
  options: {
    quoteKeys?: boolean;
  } = {},
): string {
  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return quoteSnbtString(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Cannot stringify NaN or Infinity as SNBT");
    }

    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stringifySnbt(item, options)).join(",")}]`;
  }

  const entries = Object.entries(value);

  return `{${entries
    .map(([key, value]) => {
      const outputKey =
        options.quoteKeys || !SAFE_KEY.test(key) ? quoteSnbtString(key) : key;

      return `${outputKey}:${stringifySnbt(value, options)}`;
    })
    .join(",")}}`;
}

function quoteSnbtString(value: string): string {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

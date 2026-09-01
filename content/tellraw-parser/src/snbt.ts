import type { TellrawObject, TellrawValue } from "./types";

export class SnbtParseError extends Error {
  constructor(
    message: string,
    public readonly position: number,
  ) {
    super(`${message} at position ${position}`);
    this.name = "SnbtParseError";
  }
}

export function parseSnbt(input: string): TellrawValue {
  const parser = new Parser(input);

  const value = parser.parseValue();

  parser.skipWhitespace();

  if (!parser.eof) {
    throw new SnbtParseError("Unexpected trailing data", parser.position);
  }

  return value;
}

class Parser {
  public position = 0;

  constructor(private readonly input: string) {}

  get eof(): boolean {
    return this.position >= this.input.length;
  }

  peek(): string {
    return this.input[this.position] ?? "";
  }

  skipWhitespace(): void {
    while (!this.eof && /\s/.test(this.peek())) {
      this.position++;
    }
  }

  parseValue(): TellrawValue {
    this.skipWhitespace();

    const char = this.peek();

    if (char === "{") {
      return this.parseObject();
    }

    if (char === "[") {
      return this.parseArray();
    }

    if (char === "'" || char === '"') {
      return this.parseString();
    }

    return this.parsePrimitive();
  }

  private parseObject(): TellrawObject {
    this.expect("{");

    const object: TellrawObject = {};

    this.skipWhitespace();

    if (this.peek() === "}") {
      this.position++;
      return object;
    }

    while (true) {
      this.skipWhitespace();

      const key = this.parseKey();

      this.skipWhitespace();
      this.expect(":");

      object[key] = this.parseValue();

      this.skipWhitespace();

      if (this.peek() === "}") {
        this.position++;
        return object;
      }

      this.expect(",");
    }
  }

  private parseArray(): TellrawValue[] {
    this.expect("[");

    const array: TellrawValue[] = [];

    this.skipWhitespace();

    if (this.peek() === "]") {
      this.position++;
      return array;
    }

    while (true) {
      array.push(this.parseValue());

      this.skipWhitespace();

      if (this.peek() === "]") {
        this.position++;
        return array;
      }

      this.expect(",");
    }
  }

  private parseKey(): string {
    this.skipWhitespace();

    const char = this.peek();

    if (char === "'" || char === '"') {
      return this.parseString();
    }

    const start = this.position;

    while (!this.eof) {
      const char = this.peek();

      if (char === ":" || /\s/.test(char)) {
        break;
      }

      this.position++;
    }

    if (this.position === start) {
      throw new SnbtParseError("Expected object key", this.position);
    }

    return this.input.slice(start, this.position);
  }

  private parseString(): string {
    const quote = this.peek();

    this.position++;

    let result = "";

    while (!this.eof) {
      const char = this.peek();

      this.position++;

      if (char === quote) {
        return result;
      }

      if (char === "\\") {
        if (this.eof) {
          throw new SnbtParseError(
            "Unterminated escape sequence",
            this.position,
          );
        }

        const escaped = this.peek();

        this.position++;

        switch (escaped) {
          case "n":
            result += "\n";
            break;

          case "r":
            result += "\r";
            break;

          case "t":
            result += "\t";
            break;

          case "\\":
            result += "\\";
            break;

          case "'":
            result += "'";
            break;

          case '"':
            result += '"';
            break;

          default:
            result += escaped;
        }
      } else {
        result += char;
      }
    }

    throw new SnbtParseError("Unterminated string", this.position);
  }

  private parsePrimitive(): TellrawValue {
    const start = this.position;

    while (!this.eof) {
      const char = this.peek();

      if (char === "," || char === "}" || char === "]" || /\s/.test(char)) {
        break;
      }

      this.position++;
    }

    const value = this.input.slice(start, this.position);

    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    if (value === "null") {
      return null;
    }

    if (
      /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?[bBsSlLfFdD]?$/.test(value)
    ) {
      const number = Number(value.replace(/[bBsSlLfFdD]$/, ""));

      if (Number.isFinite(number)) {
        return number;
      }
    }

    return value;
  }

  private expect(char: string): void {
    this.skipWhitespace();

    if (this.peek() !== char) {
      throw new SnbtParseError(
        `Expected '${char}', got '${this.peek()}'`,
        this.position,
      );
    }

    this.position++;
  }
}

export type TellrawValue =
  | string
  | number
  | boolean
  | null
  | TellrawObject
  | TellrawValue[];

export interface TellrawObject {
  [key: string]: TellrawValue;
}

export interface ParsedTellraw {
  command: "tellraw";
  target: string;
  data: TellrawValue;

  /**
   * Format des Inputs.
   */
  format: "snbt" | "json";

  /**
   * Originaler Command.
   */
  raw: string;
}

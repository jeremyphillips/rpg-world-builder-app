const LIST_PREFIX = /^\s*(?:[-*]|\d+[.)])\s*/

/**
 * Parse pasted bullet/markdown lines into acceptance-criteria strings.
 * - Split on newlines
 * - Strip leading `-`, `*`, numbered list prefixes
 * - Drop empty lines
 * - Trim each item (UI/service may trim again on persist)
 */
export function parseAcceptanceCriteria(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.replace(LIST_PREFIX, '').trim())
    .filter((line) => line.length > 0)
}

import { joinArrayItemSummaryParts } from '@rpg/ui'

/** Middle-dot segment for `[N] grant` / `[N] grants` in array item summaries. */
export function formatGrantCountSummaryPart(count: number): string | undefined {
  if (count <= 0) return undefined
  return `${count} grant${count === 1 ? '' : 's'}`
}

export function appendGrantCountSummaryPart(parts: string[], grantCount: number): void {
  const part = formatGrantCountSummaryPart(grantCount)
  if (part) parts.push(part)
}

export function formatCharacterLevelSummaryPart(
  level: number | string | null | undefined,
): string | undefined {
  if (level === undefined || level === null || level === '') return undefined
  return `Level ${level}`
}

/** Joins summary segments with the shared array-item middle dot. */
export function joinFormArrayItemSummaryParts(parts: readonly string[]): string {
  return joinArrayItemSummaryParts(parts)
}

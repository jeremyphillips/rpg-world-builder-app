export const FILENAME_PREVIEW_ELLIPSIS = '…'

export const FILENAME_PREVIEW_MAX_COMFORTABLE = 36
export const FILENAME_PREVIEW_MAX_COMPACT = 24
/** Narrow metadata rows such as the media manager details panel. */
export const FILENAME_PREVIEW_MAX_METADATA = 22

export type FilenamePreviewDensity = 'comfortable' | 'compact' | 'metadata'

export function resolveFilenamePreviewMaxLength(
  density: FilenamePreviewDensity = 'comfortable',
  maxLength?: number,
): number {
  if (maxLength !== undefined) return maxLength
  if (density === 'metadata') return FILENAME_PREVIEW_MAX_METADATA
  return density === 'compact' ? FILENAME_PREVIEW_MAX_COMPACT : FILENAME_PREVIEW_MAX_COMFORTABLE
}

export function splitFilename(filename: string): { base: string; extension: string } {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot <= 0 || lastDot === filename.length - 1) {
    return { base: filename, extension: '' }
  }
  return {
    base: filename.slice(0, lastDot),
    extension: filename.slice(lastDot),
  }
}

function resolveTailSegment(base: string): string {
  const hyphen = base.lastIndexOf('-')
  if (hyphen >= 0) {
    const tail = base.slice(hyphen)
    if (tail.length >= 4) return tail
  }
  const wordTail = base.match(/(?:\s+|—)\S+$/u)
  if (wordTail?.[0] && wordTail[0].length >= 4) return wordTail[0]
  return ''
}

function trimHeadToHyphenBoundary(head: string): string {
  const lastHyphen = head.lastIndexOf('-')
  if (lastHyphen <= 0) return head
  return head.slice(0, lastHyphen + 1)
}

export function truncateFilename(
  filename: string,
  maxLength: number,
): { display: string; truncated: boolean } {
  if (filename.length <= maxLength) {
    return { display: filename, truncated: false }
  }

  const { base, extension } = splitFilename(filename)
  const reserved = FILENAME_PREVIEW_ELLIPSIS.length + extension.length
  const tailSegment = resolveTailSegment(base)

  if (tailSegment.length >= 4) {
    const headBudget = maxLength - reserved - tailSegment.length
    if (headBudget >= 1) {
      const head = trimHeadToHyphenBoundary(base.slice(0, headBudget))
      if (head.length >= 1) {
        return {
          display: `${head}${FILENAME_PREVIEW_ELLIPSIS}${tailSegment}${extension}`,
          truncated: true,
        }
      }
    }
  }

  const available = maxLength - reserved
  if (available < 2) {
    const tail = extension || base.slice(-1)
    const headBudget = Math.max(1, maxLength - FILENAME_PREVIEW_ELLIPSIS.length - tail.length)
    const display = `${base.slice(0, headBudget)}${FILENAME_PREVIEW_ELLIPSIS}${tail}`
    return { display, truncated: display !== filename }
  }

  const tail = base.slice(-Math.min(Math.max(4, Math.floor(available * 0.35)), available - 1))
  const headBudget = available - tail.length
  const head = headBudget >= 1 ? base.slice(0, headBudget) : base.slice(0, 1)

  return {
    display: `${head}${FILENAME_PREVIEW_ELLIPSIS}${tail}${extension}`,
    truncated: true,
  }
}

export const FILENAME_PREVIEW_ELLIPSIS = '…'

export const FILENAME_PREVIEW_MAX_COMFORTABLE = 36
export const FILENAME_PREVIEW_MAX_COMPACT = 24
/** Narrow metadata rows such as the media manager details panel. */
export const FILENAME_PREVIEW_MAX_METADATA = 22

export type FilenamePreviewDensity = 'comfortable' | 'compact' | 'metadata'

const MOJIBAKE_HINT = /[\u00C0-\u00FF]/

let graphemeSegmenter: Intl.Segmenter | undefined

function getGraphemeSegmenter(): Intl.Segmenter {
  graphemeSegmenter ??= new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  return graphemeSegmenter
}

function splitGraphemes(value: string): readonly string[] {
  return [...getGraphemeSegmenter().segment(value)].map((part) => part.segment)
}

function graphemeCount(value: string): number {
  return splitGraphemes(value).length
}

function sliceGraphemes(value: string, start: number, end?: number): string {
  return splitGraphemes(value).slice(start, end).join('')
}

/** Repair common UTF-8 filenames that were misread as Latin-1 (e.g. `DALLÂ·E` → `DALL·E`). */
export function repairFilenameMojibake(filename: string): string {
  if (!MOJIBAKE_HINT.test(filename)) return filename

  const bytes = Uint8Array.from(filename, (char) => char.charCodeAt(0) & 0xff)
  try {
    const repaired = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return repaired.includes('\uFFFD') ? filename : repaired
  } catch {
    return filename
  }
}

export function prepareFilenameForDisplay(filename: string): string {
  return repairFilenameMojibake(filename).normalize('NFC')
}

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
    if (graphemeCount(tail) >= 4) return tail
  }
  const wordTail = base.match(/(?:\s+|—)\S+$/u)
  if (wordTail?.[0] && graphemeCount(wordTail[0]) >= 4) return wordTail[0]
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
  const prepared = prepareFilenameForDisplay(filename)

  if (graphemeCount(prepared) <= maxLength) {
    return { display: prepared, truncated: false }
  }

  const { base, extension } = splitFilename(prepared)
  const reserved = graphemeCount(FILENAME_PREVIEW_ELLIPSIS) + graphemeCount(extension)
  const tailSegment = resolveTailSegment(base)

  if (graphemeCount(tailSegment) >= 4) {
    const headBudget = maxLength - reserved - graphemeCount(tailSegment)
    if (headBudget >= 1) {
      const head = trimHeadToHyphenBoundary(sliceGraphemes(base, 0, headBudget))
      if (graphemeCount(head) >= 1) {
        return {
          display: `${head}${FILENAME_PREVIEW_ELLIPSIS}${tailSegment}${extension}`,
          truncated: true,
        }
      }
    }
  }

  const available = maxLength - reserved
  if (available < 2) {
    const tail = extension || sliceGraphemes(base, -1)
    const headBudget = Math.max(
      1,
      maxLength - graphemeCount(FILENAME_PREVIEW_ELLIPSIS) - graphemeCount(tail),
    )
    const display = `${sliceGraphemes(base, 0, headBudget)}${FILENAME_PREVIEW_ELLIPSIS}${tail}`
    return { display, truncated: display !== prepared }
  }

  const tailLength = Math.min(Math.max(4, Math.floor(available * 0.35)), available - 1)
  const tail = sliceGraphemes(base, -tailLength)
  const headBudget = available - graphemeCount(tail)
  const head = headBudget >= 1 ? sliceGraphemes(base, 0, headBudget) : sliceGraphemes(base, 0, 1)

  return {
    display: `${head}${FILENAME_PREVIEW_ELLIPSIS}${tail}${extension}`,
    truncated: true,
  }
}

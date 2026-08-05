import type { ContentCardHeadingRowRhythm } from './content-card.variants'

export function resolveContentCardHeadingRowRhythm({
  hasSecondaryText,
  hasHeadingEndSlot,
}: {
  hasSecondaryText: boolean
  hasHeadingEndSlot: boolean
}): ContentCardHeadingRowRhythm {
  if (!hasSecondaryText) {
    return 'none'
  }

  return hasHeadingEndSlot ? 'withHeadingEndSlot' : 'secondary'
}

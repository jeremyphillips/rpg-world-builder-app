import type { ContentCardHeadingRowRhythm } from './content-card.variants'

export function resolveContentCardHeadingRowRhythm({
  hasSecondaryText,
}: {
  hasSecondaryText: boolean
}): ContentCardHeadingRowRhythm {
  if (!hasSecondaryText) {
    return 'none'
  }

  return 'secondary'
}

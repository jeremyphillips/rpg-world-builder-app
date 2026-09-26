import type { ContentCardDensity } from './content-card.variants'
import type { IdentityFrameSize } from './identity-frame-tokens.variants'

export function resolveContentCardMediaFrameSize(
  density: ContentCardDensity,
): Extract<IdentityFrameSize, 'xs' | 'sm'> {
  return density === 'compact' ? 'xs' : 'sm'
}

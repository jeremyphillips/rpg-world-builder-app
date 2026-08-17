import type { ContentPlayActor } from './content-play-actor'
import {
  isContentCampaignEligible,
  isContentPlayableFor,
  isContentReferenceable,
  type ContentResolutionRow,
} from './content-resolution-policy'

export type ContentPurposeSelectors<T extends ContentResolutionRow> = {
  readonly visible: readonly T[]
  forReference(): T[]
  forCampaignUse(): T[]
  forPlay(playActor: ContentPlayActor): T[]
}

/** Builds purpose-aware selectors over one viewer-visible catalog. */
export function buildContentPurposeSelectors<T extends ContentResolutionRow>(
  visible: readonly T[],
): ContentPurposeSelectors<T> {
  return {
    visible,
    forReference: () => visible.filter(isContentReferenceable),
    forCampaignUse: () => visible.filter(isContentCampaignEligible),
    forPlay: (playActor) => visible.filter((row) => isContentPlayableFor(row, playActor)),
  }
}

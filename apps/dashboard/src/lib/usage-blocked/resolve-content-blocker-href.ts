import type { ContentUsageBlocker } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

/** Resolves dashboard navigation for a content usage blocker. */
export function resolveContentBlockerHref(
  campaignId: string,
  blocker: Extract<ContentUsageBlocker, { kind: 'content' }>,
): string {
  if (blocker.contentTypeKey === 'species') {
    return ROUTES.content.species.detail(campaignId, blocker.id)
  }

  return ROUTES.homebrew.hub(campaignId)
}

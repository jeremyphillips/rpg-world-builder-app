import type { ContentUsageReference } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

/** Resolves dashboard navigation for a domain usage reference. */
export function resolveContentUsageReferenceHref(ref: ContentUsageReference): string {
  if (ref.characterType === 'pc') {
    return ROUTES.characters.detail(ref.id)
  }

  if (!ref.campaignId) {
    return ROUTES.characters.detail(ref.id)
  }

  return ROUTES.campaign.npcs.detail(ref.campaignId, ref.id)
}

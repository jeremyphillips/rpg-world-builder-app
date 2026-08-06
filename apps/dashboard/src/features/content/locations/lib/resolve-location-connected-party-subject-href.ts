import type { LocationConnectedPartySubject } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import { resolveCampaignCharacterDetailHref } from '@/lib/routing/resolve-campaign-character-detail-href'

/** Detail href for a connected-party subject (organization, campaign PC, or NPC). */
export function resolveLocationConnectedPartySubjectHref(
  campaignId: string,
  subject: LocationConnectedPartySubject,
): string {
  if (subject.type === 'organization') {
    return ROUTES.content.organizations.detail(campaignId, subject.id)
  }

  return resolveCampaignCharacterDetailHref(
    { campaignId },
    {
      characterType: subject.characterType,
      character: { id: subject.id },
    },
  )
}

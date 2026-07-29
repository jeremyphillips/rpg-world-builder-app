import type { PcCharacterListItem } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

export type CharacterDetailHrefInput =
  | { scope: 'standalone'; characterId: string }
  | { scope: 'campaign'; campaignId: string; characterId: string }
  | Pick<PcCharacterListItem, 'id' | 'routeContext'>

/** Resolve the canonical dashboard detail href for a PC sheet. */
export function resolveCharacterDetailHref(input: CharacterDetailHrefInput): string {
  if ('routeContext' in input) {
    if (input.routeContext.kind === 'campaign') {
      return ROUTES.campaign.characters.detail(input.routeContext.openCampaign.id, input.id)
    }

    return ROUTES.characters.detail(input.id)
  }

  if (input.scope === 'campaign') {
    return ROUTES.campaign.characters.detail(input.campaignId, input.characterId)
  }

  return ROUTES.characters.detail(input.characterId)
}

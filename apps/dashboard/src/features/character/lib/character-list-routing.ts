import type { PcCharacterListItem } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

/** Build the detail href for a personal character list row from route context. */
export function resolvePersonalCharacterDetailHref(
  character: Pick<PcCharacterListItem, 'id' | 'routeContext'>,
): string {
  if (character.routeContext.kind === 'campaign') {
    return ROUTES.campaign.characters.detail(character.routeContext.openCampaign.id, character.id)
  }

  return ROUTES.characters.detail(character.id)
}

export const CHARACTERS_INDEX_SECTION_LABELS = {
  inCampaigns: 'In campaigns',
  notInCampaign: 'Not in a campaign',
} as const

export const CAMPAIGN_CHARACTER_UNASSIGNED_LABEL = 'Unassigned'

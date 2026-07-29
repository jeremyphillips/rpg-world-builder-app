import type { CampaignRole } from '@rpg/contracts'
import { isCampaignManager } from '@rpg/contracts'

export type CampaignCharactersNavModel = {
  showCharactersNav: boolean
  sidebarLabel: 'My character' | 'My characters' | 'Characters'
  pageTitle: string
  listScope: 'controlled' | 'all_participating'
}

export function buildCampaignCharactersNavModel(input: {
  role: CampaignRole
  controlledCount: number
}): CampaignCharactersNavModel {
  if (input.role === 'observer') {
    return {
      showCharactersNav: false,
      sidebarLabel: 'Characters',
      pageTitle: 'Characters',
      listScope: 'controlled',
    }
  }

  if (isCampaignManager(input.role)) {
    return {
      showCharactersNav: true,
      sidebarLabel: 'Characters',
      pageTitle: 'Characters',
      listScope: 'all_participating',
    }
  }

  const sidebarLabel = input.controlledCount === 1 ? 'My character' : 'My characters'

  return {
    showCharactersNav: true,
    sidebarLabel,
    pageTitle: sidebarLabel,
    listScope: 'controlled',
  }
}

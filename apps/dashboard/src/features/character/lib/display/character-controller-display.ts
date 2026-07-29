import type { CampaignCharacterListItem, CampaignPartyPcListItem } from '@rpg/contracts'

import { CHARACTER_CONTROLLER_DISPLAY } from './character-display-labels'

export type CharacterControllerRef = {
  displayName: string
}

export function normalizePartyController(
  member: CampaignPartyPcListItem['member'],
): CharacterControllerRef | null {
  if (!member) {
    return null
  }

  return { displayName: member.displayName }
}

export function normalizeListController(
  controller: CampaignCharacterListItem['controller'],
): CharacterControllerRef | null {
  if (!controller) {
    return null
  }

  return { displayName: controller.displayName }
}

export function resolveCharacterControllerDisplay({
  controller,
  viewerControlsCharacter,
}: {
  controller: CharacterControllerRef | null
  viewerControlsCharacter: boolean
}): string {
  if (!controller) {
    return CHARACTER_CONTROLLER_DISPLAY.noPlayerAssigned
  }

  if (viewerControlsCharacter) {
    return CHARACTER_CONTROLLER_DISPLAY.playedByYou
  }

  return CHARACTER_CONTROLLER_DISPLAY.playedBy(controller.displayName)
}

import type { BadgeAppearance, BadgeTone } from '@rpg/ui'
import { CHARACTER_ROSTER_STATUS_ENTRIES, type CharacterRosterStatus } from '@rpg/contracts'

export type CharacterRosterStatusPresentation = {
  label: string
  appearance: BadgeAppearance
  tone: BadgeTone
}

export function resolveCharacterRosterStatusPresentation(
  status: CharacterRosterStatus,
): CharacterRosterStatusPresentation {
  const label = CHARACTER_ROSTER_STATUS_ENTRIES[status].label

  switch (status) {
    case 'active':
      return { label, appearance: 'neutral', tone: 'neutral' }
    case 'inactive':
      return { label, appearance: 'outline', tone: 'neutral' }
    case 'retired':
      return { label, appearance: 'soft', tone: 'neutral' }
  }
}

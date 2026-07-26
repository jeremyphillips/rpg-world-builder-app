import type { BadgeAppearance, BadgeTone } from '@rpg/ui'
import { CHARACTER_VITAL_STATUS_ENTRIES, type CharacterVitalStatus } from '@rpg/contracts'

export type CharacterVitalStatusPresentation = {
  label: string
  appearance: BadgeAppearance
  tone: BadgeTone
}

export function resolveCharacterVitalStatusPresentation(
  status: CharacterVitalStatus,
): CharacterVitalStatusPresentation {
  const label = CHARACTER_VITAL_STATUS_ENTRIES[status].label

  switch (status) {
    case 'alive':
      return { label, appearance: 'neutral', tone: 'neutral' }
    case 'unknown':
      return { label, appearance: 'outline', tone: 'neutral' }
    case 'deceased':
      return { label, appearance: 'neutral', tone: 'destructive' }
  }
}

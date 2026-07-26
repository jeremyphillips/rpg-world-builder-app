import type { BadgeAppearance, BadgeTone } from '@rpg/ui'
import {
  CHARACTER_ROSTER_STATUS_ENTRIES,
  CHARACTER_VITAL_STATUS_ENTRIES,
  type CharacterRosterStatus,
  type CharacterVitalStatus,
} from '@rpg/contracts'

export type CharacterLifecycleStatusPresentation = {
  label: string
  appearance: BadgeAppearance
  tone: BadgeTone
}

export function resolveCharacterRosterStatusPresentation(
  status: CharacterRosterStatus,
): CharacterLifecycleStatusPresentation {
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

export function resolveCharacterVitalStatusPresentation(
  status: CharacterVitalStatus,
): CharacterLifecycleStatusPresentation {
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

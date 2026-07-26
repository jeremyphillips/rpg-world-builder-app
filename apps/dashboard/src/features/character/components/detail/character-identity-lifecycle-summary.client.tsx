'use client'

import type { CharacterLifecycle } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  resolveCharacterRosterStatusPresentation,
  resolveCharacterVitalStatusPresentation,
} from '../../lib/character-lifecycle-presentation'

export type CharacterIdentityLifecycleSummaryProps = {
  lifecycle: CharacterLifecycle
}

/** Read-only roster and vital summary for character detail identity. */
export function CharacterIdentityLifecycleSummary({
  lifecycle,
}: CharacterIdentityLifecycleSummaryProps) {
  const roster = resolveCharacterRosterStatusPresentation(lifecycle.roster.status)
  const vital = resolveCharacterVitalStatusPresentation(lifecycle.vital.status)

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <Text as="span" variant="muted">
        Roster: {roster.label}
      </Text>
      <Text as="span" variant="muted">
        Vital: {vital.label}
      </Text>
    </div>
  )
}

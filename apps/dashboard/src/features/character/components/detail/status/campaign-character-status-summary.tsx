import type { CharacterRosterState, CharacterVitalState } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { resolveCharacterRosterStatusPresentation } from '../../../lib/campaign-roster-presentation'
import { resolveCharacterVitalStatusPresentation } from '../../../lib/display/character-vital-presentation'

export type CampaignCharacterStatusSummaryProps = {
  vital: CharacterVitalState
  roster: CharacterRosterState
}

/** Read-only roster and vital summary for campaign NPC detail identity. */
export function CampaignCharacterStatusSummary({
  vital,
  roster,
}: CampaignCharacterStatusSummaryProps) {
  const rosterPresentation = resolveCharacterRosterStatusPresentation(roster.status)
  const vitalPresentation = resolveCharacterVitalStatusPresentation(vital.status)

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <Text as="span" variant="muted">
        Roster: {rosterPresentation.label}
      </Text>
      <Text as="span" variant="muted">
        Vital: {vitalPresentation.label}
      </Text>
    </div>
  )
}

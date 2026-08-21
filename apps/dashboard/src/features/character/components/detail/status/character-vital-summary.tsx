import type { CharacterVitalState } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { resolveCharacterVitalStatusPresentation } from '../../../lib/display/character-vital-presentation'

export type CharacterVitalSummaryProps = {
  vital: CharacterVitalState
}

/** Read-only vital summary for standalone character detail identity. */
export function CharacterVitalSummary({ vital }: CharacterVitalSummaryProps) {
  const presentation = resolveCharacterVitalStatusPresentation(vital.status)

  return (
    <Text as="span" variant="muted" className="text-sm">
      Vital: {presentation.label}
    </Text>
  )
}

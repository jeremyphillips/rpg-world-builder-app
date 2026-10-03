import { useContext, useMemo } from 'react'

import type { CharacterBuildAdvisory } from '@rpg/contracts'

import type { EntitySummaryStatusItem } from '@/features/content'
import { CharacterBuildAdvisoriesContext } from '../components/build-advisories/character-build-advisories-context'
import {
  buildAdvisoryStatusItems,
  lookupBuildAdvisoriesForEquipment,
} from '../lib/build-advisories/build-advisory-presentation.lib'

/** Live advisories from the nearest provider; `[]` outside one. */
export function useCharacterBuildAdvisoriesValue(): readonly CharacterBuildAdvisory[] {
  return useContext(CharacterBuildAdvisoriesContext).advisories
}

/** Warning status lines for an equipment row; `[]` outside a provider. */
export function useEquipmentAdvisoryStatus(
  equipmentId: string | undefined,
): EntitySummaryStatusItem[] {
  const { byEquipmentId, rulesetId } = useContext(CharacterBuildAdvisoriesContext)
  return useMemo(
    () =>
      equipmentId
        ? buildAdvisoryStatusItems(
            lookupBuildAdvisoriesForEquipment(byEquipmentId, equipmentId, rulesetId),
          )
        : [],
    [byEquipmentId, equipmentId, rulesetId],
  )
}

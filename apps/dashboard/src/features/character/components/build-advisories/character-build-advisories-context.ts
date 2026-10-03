import { createContext } from 'react'

import type { CharacterBuildAdvisory } from '@rpg/contracts'

import type { indexBuildAdvisoriesByEquipmentId } from '../../lib/build-advisories/build-advisory-presentation.lib'

export type CharacterBuildAdvisoriesValue = {
  advisories: readonly CharacterBuildAdvisory[]
  byEquipmentId: ReturnType<typeof indexBuildAdvisoriesByEquipmentId>
  rulesetId?: string
}

export const CharacterBuildAdvisoriesContext = createContext<CharacterBuildAdvisoriesValue>({
  advisories: [],
  byEquipmentId: new Map(),
})

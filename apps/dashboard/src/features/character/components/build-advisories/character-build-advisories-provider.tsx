import { useMemo, type ReactNode } from 'react'

import type { CharacterBuildAdvisory } from '@rpg/contracts'

import { indexBuildAdvisoriesByEquipmentId } from '../../lib/build-advisories/build-advisory-presentation.lib'
import { CharacterBuildAdvisoriesContext } from './character-build-advisories-context'

/** Live build advisories for inventory rows and Review below the builder shell. */
export function CharacterBuildAdvisoriesProvider({
  advisories,
  rulesetId,
  children,
}: {
  advisories: readonly CharacterBuildAdvisory[]
  rulesetId?: string
  children: ReactNode
}) {
  const value = useMemo(
    () => ({
      advisories,
      byEquipmentId: indexBuildAdvisoriesByEquipmentId(advisories),
      rulesetId,
    }),
    [advisories, rulesetId],
  )
  return (
    <CharacterBuildAdvisoriesContext.Provider value={value}>
      {children}
    </CharacterBuildAdvisoriesContext.Provider>
  )
}

import { useContext } from 'react'

import type { CharacterBuildAdvisory } from '@rpg/contracts'

import { CharacterBuildAdvisoriesContext } from '../components/build-advisories/character-build-advisories-context'

/** Live advisories from the nearest provider; `[]` outside one. */
export function useCharacterBuildAdvisoriesValue(): readonly CharacterBuildAdvisory[] {
  return useContext(CharacterBuildAdvisoriesContext).advisories
}

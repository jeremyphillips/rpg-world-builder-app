import type { CharacterBuildLoadout } from '../assembly/resolve-character-build-loadout'

/**
 * Facts every advisory rule evaluates. `equipment` is the loadout finalize persists.
 * Proficiency advisories also read pending explicit purchases on `effectiveDraft`.
 */
export type CharacterBuildAdvisoryFacts = Pick<
  CharacterBuildLoadout,
  'effectiveDraft' | 'equipment' | 'proficiencies' | 'catalogIndex'
>

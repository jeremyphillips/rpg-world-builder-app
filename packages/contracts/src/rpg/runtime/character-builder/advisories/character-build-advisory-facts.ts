import type { CharacterBuildLoadout } from '../assembly/resolve-character-build-loadout'

/** Facts every advisory rule evaluates — the same loadout finalize persists. */
export type CharacterBuildAdvisoryFacts = Pick<
  CharacterBuildLoadout,
  'effectiveDraft' | 'equipment' | 'proficiencies' | 'catalogIndex'
>

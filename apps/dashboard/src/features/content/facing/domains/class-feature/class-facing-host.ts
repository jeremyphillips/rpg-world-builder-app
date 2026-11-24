import type {
  CharacterClass,
  ResolvedSpellcastingProgressionConfig,
  Spell,
  Spellcasting,
} from '@rpg/contracts'

export type ClassFacingHostContext = {
  className: string
  rulesetId: CharacterClass['rulesetId']
  spellcasting?: Spellcasting
  spellcastingProgression?: ResolvedSpellcastingProgressionConfig
  spellsById?: ReadonlyMap<string, Spell>
}

import { joinInlineMetadata } from '../../../../primitives/inline-metadata'
import { ABILITY_ENTRIES, type Ability } from '../../../../vocab/ability'

/** Formats a saving throw row label, e.g. `DEX · Dexterity`. */
export function formatSavingThrowProficiencyLabel(ability: Ability): string {
  const entry = ABILITY_ENTRIES[ability]
  return joinInlineMetadata([ability.toUpperCase(), entry.label])
}

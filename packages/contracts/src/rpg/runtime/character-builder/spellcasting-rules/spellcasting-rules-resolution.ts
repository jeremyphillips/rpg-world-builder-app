import { CLASS_SPELLCASTING_CHOICE_SUFFIXES } from '../../../content/classes/spellcasting'
import {
  findCompiledChoiceProgressionBySuffix,
  type CompiledSpellcastingChoiceProgression,
  type ResolvedClassSpellcasting,
} from '../../creature/resolve-class-spellcasting'

export function spellLevelsWithOccupiedSlots(slots: readonly number[]): number[] {
  const levels: number[] = []
  slots.forEach((count, index) => {
    if (count > 0) levels.push(index + 1)
  })
  return levels
}

export function preparedQuotaRulesProgression(
  resolved: ResolvedClassSpellcasting,
): CompiledSpellcastingChoiceProgression | undefined {
  return (
    findCompiledChoiceProgressionBySuffix(
      resolved,
      CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared,
      'capacity',
    ) ??
    findCompiledChoiceProgressionBySuffix(
      resolved,
      CLASS_SPELLCASTING_CHOICE_SUFFIXES.repertoire,
      'capacity',
    )
  )
}

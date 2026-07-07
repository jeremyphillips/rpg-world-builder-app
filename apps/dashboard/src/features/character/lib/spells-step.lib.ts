import {
  formatSpellLevel,
  STEP_CHOICE_TYPES_BY_STEP,
  type CharacterBuildPreview,
  type CharacterDerivedSpellcasting,
  type ChoiceSet,
  type SpellcastingProfile,
} from '@rpg/contracts'

import {
  BUILDER_SELECTION_FULL_NOTICE,
  formatChoiceSetDrawerTriggerLabel,
  formatSelectionCounter,
  isChoiceSetSelectionFull,
  isChoiceSetSelectionOverSelected,
} from './selection-counter.lib'

const SPELLS_CHOICE_TYPES = STEP_CHOICE_TYPES_BY_STEP.spells

export const SPELLS_STEP_NON_CASTER_MESSAGE = 'This class does not use spellcasting at level 1.'

export const SPELLS_STEP_PENDING_ABILITY_LABEL = 'Pending ability scores'

export const SPELLS_STEP_SELECTION_FULL_REASON = BUILDER_SELECTION_FULL_NOTICE

/** ChoiceSets owned by the spells builder step. */
export function choiceSetsForSpellsStep(choiceSets: readonly ChoiceSet[]): ChoiceSet[] {
  if (!SPELLS_CHOICE_TYPES) return []

  return choiceSets.filter((choiceSet) => SPELLS_CHOICE_TYPES.has(choiceSet.choiceType))
}

export function formatSpellChoiceAddLabel(choiceSet: ChoiceSet): string {
  return formatChoiceSetDrawerTriggerLabel(choiceSet, {
    selectedCount: 0,
    max: choiceSet.max,
  })
}

export const formatSpellSelectionCounter = formatSelectionCounter

export const isSpellChoiceSetFull = isChoiceSetSelectionFull

export const isSpellChoiceSetOverSelected = isChoiceSetSelectionOverSelected

export { formatChoiceSetDrawerTriggerLabel }

export function resolveSelectedSpellLabels(
  choiceSet: ChoiceSet,
  selectedIds: readonly string[],
): { id: string; label: string }[] {
  return selectedIds.map((id) => {
    const option = choiceSet.options.find((entry) => entry.id === id)
    return { id, label: option?.label ?? id }
  })
}

export function formatSpellSaveDc(
  spellcasting: CharacterDerivedSpellcasting | null | undefined,
): string {
  if (!spellcasting || spellcasting.saveDc === undefined) {
    return SPELLS_STEP_PENDING_ABILITY_LABEL
  }
  return String(spellcasting.saveDc)
}

export function formatSpellAttackBonus(
  spellcasting: CharacterDerivedSpellcasting | null | undefined,
): string {
  if (!spellcasting || spellcasting.attackBonus === undefined) {
    return SPELLS_STEP_PENDING_ABILITY_LABEL
  }
  const bonus = spellcasting.attackBonus
  return bonus >= 0 ? `+${bonus}` : String(bonus)
}

export function formatSpellSlotSummary(
  spellcasting: CharacterDerivedSpellcasting | null | undefined,
): string {
  if (!spellcasting) return SPELLS_STEP_PENDING_ABILITY_LABEL

  const parts = spellcasting.slots
    .map((count, index) => (count > 0 ? `${formatSpellLevel(index + 1)}: ${count}` : null))
    .filter(Boolean)

  return parts.length > 0 ? parts.join(', ') : 'None'
}

export function formatSpellcastingCountSummary(profile: SpellcastingProfile): string {
  const parts: string[] = []
  if (profile.cantripsKnown > 0) {
    parts.push(`${profile.cantripsKnown} cantrip${profile.cantripsKnown === 1 ? '' : 's'}`)
  }
  if (profile.spellsAvailable > 0) {
    parts.push(`${profile.spellsAvailable} spell${profile.spellsAvailable === 1 ? '' : 's'}`)
  }
  return parts.join(', ')
}

export function spellcastingPreviewStats(
  preview: CharacterBuildPreview | null,
): CharacterDerivedSpellcasting | null {
  return preview?.spellcasting ?? null
}

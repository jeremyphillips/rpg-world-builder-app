import {
  formatProficiencyChoiceEmptyMessage,
  getToolCategoryLabel,
  type CharacterBuildCatalogIndex,
  type CharacterBuildPreview,
  type CharacterBuilderDraft,
  type CharacterBuildPreviewSavingThrow,
  type ChoiceSet,
} from '@rpg/contracts'

import { resolveLanguagePreviewLabel } from './language-preview-label'

export const PREVIEW_PENDING_ABILITY_LABEL = 'pending'

export const PREVIEW_NO_TOOL_PROFICIENCIES_HINT = 'No tool proficiencies chosen yet.'
export const PREVIEW_SAVING_THROWS_NO_CLASS_HINT =
  'Class saving throws appear after you choose a class.'

export type PreviewProficiencySubsection = {
  resolvedText: string | null
  emptyHint: string | null
  remainingText: string | null
}

function formatRemainingChoiceLine(count: number, categoryLabel: string): string | null {
  if (count <= 0) return null
  return `${count} ${categoryLabel} choice${count === 1 ? '' : 's'} remaining`
}

export function countProficiencyChoicesRemaining(
  choiceSets: readonly ChoiceSet[],
  draft: CharacterBuilderDraft,
  choiceType: ChoiceSet['choiceType'],
): number {
  return choiceSets
    .filter((choiceSet) => choiceSet.choiceType === choiceType && choiceSet.required)
    .reduce((total, choiceSet) => {
      const selected = (draft.choiceSelections[choiceSet.id] ?? []).length
      return total + Math.max(choiceSet.max - selected, 0)
    }, 0)
}

function formatSavingThrowEntry(save: CharacterBuildPreviewSavingThrow): string {
  const ability = save.ability.toUpperCase()
  if (save.bonus === undefined) {
    return `${ability} ${PREVIEW_PENDING_ABILITY_LABEL}`
  }

  const modLabel = save.bonus >= 0 ? `+${save.bonus}` : String(save.bonus)
  return `${ability} ${modLabel}`
}

function resolveToolPreviewLabel(
  tool: CharacterBuildPreview['proficiencies']['tools'][number],
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  if (tool.toolId) {
    return catalogIndex.equipment.get(tool.toolId)?.name ?? tool.toolId
  }

  if (tool.toolCategory) {
    return getToolCategoryLabel(tool.toolCategory)
  }

  return 'Tool proficiency'
}

export function formatPreviewSavingThrowsSubsection(
  preview: CharacterBuildPreview,
  hasCharacterClass: boolean,
): PreviewProficiencySubsection {
  if (!hasCharacterClass) {
    return {
      resolvedText: null,
      emptyHint: PREVIEW_SAVING_THROWS_NO_CLASS_HINT,
      remainingText: null,
    }
  }

  const resolvedText = preview.savingThrows
    .filter((save) => save.proficient)
    .map(formatSavingThrowEntry)
    .join(', ')

  return {
    resolvedText: resolvedText.length > 0 ? resolvedText : null,
    emptyHint: null,
    remainingText: null,
  }
}

export function formatPreviewSkillsSubsection(
  preview: CharacterBuildPreview,
  skillChoicesRemaining: number,
): PreviewProficiencySubsection {
  const resolvedText = preview.skills
    .filter((skill) => skill.rank !== undefined)
    .map((skill) => skill.label)
    .join(', ')

  return {
    resolvedText: resolvedText.length > 0 ? resolvedText : null,
    emptyHint:
      resolvedText.length > 0 ? null : formatProficiencyChoiceEmptyMessage('skillProficiency'),
    remainingText: formatRemainingChoiceLine(skillChoicesRemaining, 'skill'),
  }
}

export function formatPreviewLanguagesSubsection(
  preview: CharacterBuildPreview,
  catalogIndex: CharacterBuildCatalogIndex,
  languageChoicesRemaining: number,
): PreviewProficiencySubsection {
  const resolvedText = preview.proficiencies.languages
    .map((entry) => resolveLanguagePreviewLabel(entry.language, catalogIndex))
    .join(', ')

  return {
    resolvedText: resolvedText.length > 0 ? resolvedText : null,
    emptyHint: resolvedText.length > 0 ? null : 'No languages yet.',
    remainingText: formatRemainingChoiceLine(languageChoicesRemaining, 'language'),
  }
}

export function formatPreviewToolsSubsection(
  preview: CharacterBuildPreview,
  catalogIndex: CharacterBuildCatalogIndex,
  toolChoicesRemaining: number,
): PreviewProficiencySubsection {
  const resolvedText = preview.proficiencies.tools
    .map((tool) => resolveToolPreviewLabel(tool, catalogIndex))
    .join(', ')

  return {
    resolvedText: resolvedText.length > 0 ? resolvedText : null,
    emptyHint: resolvedText.length > 0 ? null : PREVIEW_NO_TOOL_PROFICIENCIES_HINT,
    remainingText: formatRemainingChoiceLine(toolChoicesRemaining, 'tool proficiency'),
  }
}

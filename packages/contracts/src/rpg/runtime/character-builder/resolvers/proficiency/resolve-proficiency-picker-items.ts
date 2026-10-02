import type { CharacterProficiencies } from '../../../character/sheet/proficiencies'
import type { SkillProficiencyCompactSummary } from '../../../../content/lib/skill-proficiency-compact-display'
import { buildSkillProficiencyCompactSummary } from '../../../../content/lib/skill-proficiency-compact-display'
import type { ChoiceSet } from '../../choice-set'
import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../../context'
import { indexCharacterBuildCatalog } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import { resolveToolIdFromOption } from '../../assembly/assemble-tool-proficiencies'
import {
  PICKER_DISABLED_REASON_SELECTION_FULL,
  type PickerItemStateBase,
} from '../picker/picker-item-state'
import { resolveAvailableChoices } from '../registry/resolve-choices'
import { formatStandardSelectionSourceLabel } from '../../../character/format-selection-source-label'
import { deriveRecommendedLanguageIds } from './derive-recommended-language-ids'
import {
  NEUTRAL_OPTION_RECOMMENDATION,
  softRecommendationFact,
  type OptionPresentationFacts,
  type OptionRecommendation,
} from '../../recommendation'

export type ProficiencyPickerItemState = PickerItemStateBase & {
  isAlreadySelected: boolean
  isAlreadyGranted: boolean
  isSelectionFull: boolean
  canSelect: boolean
  /** Soft recommendation. `isRecommended` mirrors `strength === 'strong'` for browse parity. */
  recommendation: OptionRecommendation
  presentation?: OptionPresentationFacts
}

export type ProficiencyPickerItem = {
  optionId: string
  label: string
  state: ProficiencyPickerItemState
  compactSummary?: SkillProficiencyCompactSummary
}

export type ResolveProficiencyPickerItemsArgs = {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  choiceSetId: string
  proficiencies: CharacterProficiencies
}

function languageRecommendation(args: {
  choiceType: ChoiceSet['choiceType']
  optionId: string
  recommendedLanguageIds: ReadonlySet<string>
  speciesId: string | undefined
}): OptionRecommendation {
  if (args.choiceType !== 'language' || !args.speciesId) return NEUTRAL_OPTION_RECOMMENDATION
  if (!args.recommendedLanguageIds.has(args.optionId)) return NEUTRAL_OPTION_RECOMMENDATION
  return {
    strength: 'strong',
    signals: [
      {
        strength: 'strong',
        basis: 'affinity',
        specificity: 'exact',
        source: { kind: 'species', id: args.speciesId },
      },
    ],
  }
}

function resolveSkillSlug(optionId: string, catalogIndex: CharacterBuildCatalogIndex): string {
  const skillRow = catalogIndex.skillProficiencies.get(optionId)
  return skillRow?.slug ?? optionId
}

function findGrantedSkillEntry(
  proficiencies: CharacterProficiencies,
  optionId: string,
  catalogIndex: CharacterBuildCatalogIndex,
) {
  const skillSlug = resolveSkillSlug(optionId, catalogIndex)
  return proficiencies.skills.find((entry) => entry.skill === skillSlug)
}

function findGrantedLanguageEntry(proficiencies: CharacterProficiencies, optionId: string) {
  return proficiencies.languages.find((entry) => entry.language === optionId)
}

function findGrantedToolEntry(
  proficiencies: CharacterProficiencies,
  optionId: string,
  catalogIndex: CharacterBuildCatalogIndex,
) {
  const toolId = resolveToolIdFromOption(optionId, catalogIndex)
  return proficiencies.tools.find((entry) => entry.toolId === toolId)
}

function findGrantedEntry(
  choiceSet: ChoiceSet,
  optionId: string,
  proficiencies: CharacterProficiencies,
  catalogIndex: CharacterBuildCatalogIndex,
) {
  switch (choiceSet.choiceType) {
    case 'skillProficiency':
      return findGrantedSkillEntry(proficiencies, optionId, catalogIndex)
    case 'language':
      return findGrantedLanguageEntry(proficiencies, optionId)
    case 'toolProficiency':
      return findGrantedToolEntry(proficiencies, optionId, catalogIndex)
    default:
      return undefined
  }
}

function grantedDisabledReason(
  sources: CharacterProficiencies['skills'][number]['sources'],
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const sourceLabel = formatStandardSelectionSourceLabel(sources, catalogIndex)
  return `Already granted by ${sourceLabel}`
}

function resolveProficiencyPickerItemState(
  optionId: string,
  choiceSet: ChoiceSet,
  selectedIds: readonly string[],
  proficiencies: CharacterProficiencies,
  catalogIndex: CharacterBuildCatalogIndex,
  recommendedLanguageIds: ReadonlySet<string>,
  draft: CharacterBuilderDraft,
): ProficiencyPickerItemState {
  const isAlreadySelected = selectedIds.includes(optionId)
  const isSelectionFull = selectedIds.length >= choiceSet.max
  const grantedEntry = findGrantedEntry(choiceSet, optionId, proficiencies, catalogIndex)
  const isAlreadyGranted = grantedEntry !== undefined && !isAlreadySelected
  const disabledReasons: string[] = []

  if (isAlreadyGranted) {
    disabledReasons.push(grantedDisabledReason(grantedEntry?.sources, catalogIndex))
  } else if (!isAlreadySelected && isSelectionFull) {
    disabledReasons.push(PICKER_DISABLED_REASON_SELECTION_FULL)
  }

  const recommendation = languageRecommendation({
    choiceType: choiceSet.choiceType,
    optionId,
    recommendedLanguageIds,
    speciesId: draft.species.speciesId,
  })
  const recommendationFact = softRecommendationFact({
    recommendation,
    sourceName: (source) =>
      source.kind === 'species' ? catalogIndex.species.get(source.id)?.name : undefined,
  })

  return {
    isAvailable: true,
    isRecommended: recommendation.strength === 'strong',
    recommendation,
    ...(recommendationFact ? { presentation: { facts: [recommendationFact] } } : {}),
    isAlreadySelected,
    isAlreadyGranted,
    isSelectionFull,
    canSelect: !isAlreadySelected && !isSelectionFull && !isAlreadyGranted,
    disabledReasons,
  }
}

/** Enriches a proficiency ChoiceSet's options into picker-ready rows. */
export function resolveProficiencyPickerItems({
  draft,
  context,
  choiceSetId,
  proficiencies,
}: ResolveProficiencyPickerItemsArgs): ProficiencyPickerItem[] {
  const choiceSet = resolveAvailableChoices(draft, context).find(
    (entry) => entry.id === choiceSetId,
  )
  if (!choiceSet) return []

  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const selectedIds = draft.choiceSelections[choiceSetId] ?? []
  const recommendedLanguageIds =
    choiceSet.choiceType === 'language'
      ? deriveRecommendedLanguageIds({
          draft,
          catalogIndex,
          choiceSetOptionIds: choiceSet.options.map((option) => option.id),
        })
      : new Set<string>()

  return choiceSet.options.map((option) => {
    const skillRow =
      choiceSet.choiceType === 'skillProficiency'
        ? catalogIndex.skillProficiencies.get(option.id)
        : undefined

    return {
      optionId: option.id,
      label: option.label,
      state: resolveProficiencyPickerItemState(
        option.id,
        choiceSet,
        selectedIds,
        proficiencies,
        catalogIndex,
        recommendedLanguageIds,
        draft,
      ),
      ...(skillRow ? { compactSummary: buildSkillProficiencyCompactSummary(skillRow) } : {}),
    }
  })
}
